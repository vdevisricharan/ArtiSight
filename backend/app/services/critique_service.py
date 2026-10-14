"""
Multimodal critique service for ArtiSight 2.0.
Interfaces with Google Gemini 2.5 Flash to produce validated, structured photography analysis
adhering to the 6-dimension rubric (Composition, Lighting, Focus, Color, Storytelling, Overall).
"""

import os
import json
import time
import logging
import uuid
from datetime import datetime, timezone
from PIL import Image
from google import genai
from google.genai import types

from app.config import Config
from app.schemas.critique_schema import (
    FullCritiqueResponse,
    CritiqueSummary,
    CategoryScores,
    ScoreDimension,
    ActionableRecommendation,
    ImageDimensions,
    AnalysisMetadata,
    OpenCVAnalysis,
    ExifMetadata
)
from app.services.vision_service import compute_opencv_metrics
from app.services.exif_service import extract_exif_metadata
from app.services.resource_service import get_personalized_resources
from app.utils.image_utils import get_image_dimensions

logger = logging.getLogger(__name__)

# Structured instruction template
CRITIQUE_SYSTEM_PROMPT = """You are ArtiSight, an expert photography mentor and technical judge.
Analyze the provided photograph comprehensively and objectively across these 6 core dimensions:
1. Composition (rule of thirds, subject placement, framing, leading lines, negative space, visual balance, cropping)
2. Lighting & Exposure (exposure accuracy, highlight clipping, shadow detail, contrast, dynamic range, lighting direction/quality)
3. Focus & Technical Quality (subject sharpness, depth of field, motion blur, apparent noise/grain, lens clarity)
4. Color & Tones (white balance, color harmony, saturation, tonal gradation, color contrast, palette intent)
5. Subject & Storytelling (main subject separation, visual hierarchy, emotional resonance, mood, narrative coherence)
6. Overall Photographic Impact (visual memorability, artistic execution, primary strengths and areas for growth)

Context Sensitivity:
- Do not automatically penalize intentional artistic choices (e.g., silhouettes, high-key, low-key, abstract framing, intentional motion blur). Acknowledge creative intent where inferable.
- Scores must be honest estimates from 0.0 to 10.0 (e.g. 7.5, 8.0).

You MUST output ONLY a valid JSON object matching this exact schema:
{
  "summary": {
    "title": "Short descriptive title of the critique",
    "observations": ["observation 1", "observation 2", "observation 3"],
    "strengths": ["strength 1 with specific visual evidence", "strength 2"],
    "improvements": ["concrete improvement area 1", "concrete improvement area 2"]
  },
  "scores": {
    "composition": {"value": 7.5, "rationale": "Clear rationale on framing and balance"},
    "lighting": {"value": 8.0, "rationale": "Clear rationale on illumination and tonal range"},
    "focus": {"value": 7.0, "rationale": "Clear rationale on sharpness and depth of field"},
    "color": {"value": 8.5, "rationale": "Clear rationale on color harmony and white balance"},
    "storytelling": {"value": 7.5, "rationale": "Clear rationale on subject and narrative impact"},
    "overall": {"value": 7.7, "rationale": "Balanced overall assessment"}
  },
  "recommendations": [
    {
      "problem": "Specific detected issue (e.g., Background clutter competing with subject)",
      "evidence": "Visual detail in the photo showing this issue",
      "why_it_matters": "Underlying photographic principle explained",
      "recommendation": "Specific shooting or editing adjustment to fix it",
      "exercise": "Concrete, hands-on practice shoot assignment to build this skill",
      "expected_outcome": "What the photographer will master after the exercise",
      "learning_topic": "Composition"
    }
  ],
  "learningTopics": ["Composition", "Depth of Field", "Lighting"]
}
"""


def _get_gemini_client() -> genai.Client:
    """Initialize the Google GenAI client."""
    return genai.Client(api_key=Config.GEMINI_API_KEY)


def render_markdown_critique(summary: CritiqueSummary, scores: CategoryScores, recommendations: list) -> str:
    """Generate a clean, readable Markdown version for export and backward compatibility."""
    lines = [
        f"# {summary.title}",
        "",
        "## Overall Assessment",
        f"**Overall Score:** {scores.overall.value}/10 - {scores.overall.rationale}",
        "",
        "### Key Observations",
    ]
    for obs in summary.observations:
        lines.append(f"- {obs}")

    lines.extend([
        "",
        "## Category Scores",
        f"- **Composition ({scores.composition.value}/10):** {scores.composition.rationale}",
        f"- **Lighting & Exposure ({scores.lighting.value}/10):** {scores.lighting.rationale}",
        f"- **Focus & Technical Quality ({scores.focus.value}/10):** {scores.focus.rationale}",
        f"- **Color & Tones ({scores.color.value}/10):** {scores.color.rationale}",
        f"- **Subject & Storytelling ({scores.storytelling.value}/10):** {scores.storytelling.rationale}",
        "",
        "## Key Strengths",
    ])
    for s in summary.strengths:
        lines.append(f"- {s}")

    lines.extend([
        "",
        "## Actionable Areas for Improvement",
    ])
    for imp in summary.improvements:
        lines.append(f"- {imp}")

    if recommendations:
        lines.extend([
            "",
            "## Recommended Practice Exercises",
        ])
        for idx, rec in enumerate(recommendations, 1):
            if isinstance(rec, dict):
                lines.append(f"### {idx}. {rec.get('problem', 'Improvement Task')}")
                lines.append(f"**Exercise:** {rec.get('exercise', '')}")
                lines.append(f"**Technique:** {rec.get('recommendation', '')}")
            else:
                lines.append(f"### {idx}. {rec.problem}")
                lines.append(f"**Exercise:** {rec.exercise}")
                lines.append(f"**Technique:** {rec.recommendation}")
            lines.append("")

    return "\n".join(lines)


def analyze_photo(image_path: str) -> FullCritiqueResponse:
    """
    Execute the unified multimodal analysis pipeline:
    1. Extract EXIF capture metadata (with GPS redaction)
    2. Compute deterministic OpenCV computer vision metrics
    3. Generate structured photography critique via Gemini 2.5 Flash
    4. Validate response with Pydantic schemas
    5. Aggregate personalized learning resources
    """
    start_time = time.time()
    analysis_id = str(uuid.uuid4())

    # 1. Image Dimensions
    dim_data = get_image_dimensions(image_path)
    dimensions = ImageDimensions(
        width=dim_data["width"],
        height=dim_data["height"],
        aspectRatio=dim_data["aspectRatio"]
    )

    # 2. Deterministic OpenCV Metrics
    try:
        cv_metrics = compute_opencv_metrics(image_path)
    except Exception as e:
        logger.error(f"OpenCV metric extraction failed: {e}")
        # Graceful fallback
        cv_metrics = OpenCVAnalysis(
            sharpnessIndex=100.0,
            sharpnessAssessment="Standard definition",
            brightnessMean=128.0,
            contrastRms=50.0,
            highlightClippingPercent=0.0,
            shadowClippingPercent=0.0,
            exposureEvaluation="Standard exposure balance",
            luminanceHistogram=[50] * 32,
            dominantColorHex="#808080"
        )

    # 3. EXIF Metadata
    try:
        exif_data = extract_exif_metadata(image_path)
    except Exception as e:
        logger.error(f"EXIF extraction failed: {e}")
        exif_data = ExifMetadata(hasExif=False)

    # 4. Multimodal AI Analysis with Gemini 2.5 Flash
    client = _get_gemini_client()
    pil_image = Image.open(image_path)

    # Provide CV and EXIF context to Gemini to ground the critique in measured reality
    context_notes = f"""
Measured Image Technical Data:
- Resolution: {dimensions.width}x{dimensions.height} ({dimensions.aspectRatio})
- OpenCV Mean Luminance: {cv_metrics.brightnessMean}/255
- OpenCV Highlight Clipping: {cv_metrics.highlightClippingPercent}%
- OpenCV Shadow Clipping: {cv_metrics.shadowClippingPercent}%
- OpenCV Laplacian Sharpness Variance: {cv_metrics.sharpnessIndex} ({cv_metrics.sharpnessAssessment})
"""
    if exif_data.hasExif:
        context_notes += f"- Camera: {exif_data.cameraMake or ''} {exif_data.cameraModel or ''}\n"
        if exif_data.focalLength:
            context_notes += f"- Focal Length: {exif_data.focalLength}\n"
        if exif_data.aperture:
            context_notes += f"- Aperture: {exif_data.aperture}\n"
        if exif_data.shutterSpeed:
            context_notes += f"- Shutter: {exif_data.shutterSpeed}\n"
        if exif_data.iso:
            context_notes += f"- ISO: {exif_data.iso}\n"

    prompt_contents = [
        pil_image,
        CRITIQUE_SYSTEM_PROMPT,
        context_notes,
        "Please critique this photograph and respond with the exact JSON structure specified."
    ]

    gen_config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.4,  # Lower temperature for consistent evaluation and rubric precision
        max_output_tokens=8192,
        thinking_config=types.ThinkingConfig(thinking_budget=512),
    )

    # Call Gemini model with retry
    raw_json_str = None
    last_error = None
    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=Config.GEMINI_MODEL,
                contents=prompt_contents,
                config=gen_config,
            )
            if response.text:
                raw_json_str = response.text.strip()
                break
        except Exception as e:
            last_error = e
            logger.warning(f"Gemini API attempt {attempt+1} failed: {e}")
            time.sleep(1.0)

    if not raw_json_str:
        raise RuntimeError(f"Failed to obtain critique from Gemini AI: {last_error}")

    # Parse and validate JSON
    try:
        # Strip potential markdown formatting if returned
        if raw_json_str.startswith("```json"):
            raw_json_str = raw_json_str[7:]
        if raw_json_str.startswith("```"):
            raw_json_str = raw_json_str[3:]
        if raw_json_str.endswith("```"):
            raw_json_str = raw_json_str[:-3]
        raw_json_str = raw_json_str.strip()

        parsed = json.loads(raw_json_str)
    except Exception as e:
        logger.error(f"JSON decoding error: {e} | Raw: {raw_json_str[:200]}")
        raise ValueError("AI model returned malformed JSON structure.")

    # Validate with Pydantic
    summary = CritiqueSummary(**parsed.get("summary", {}))
    scores = CategoryScores(**parsed.get("scores", {}))
    recommendations = [
        ActionableRecommendation(**rec)
        for rec in parsed.get("recommendations", [])
    ]
    learning_topics = parsed.get("learningTopics", ["Composition", "Lighting", "Focus"])

    # 5. Personalized Educational Resources
    weakness_texts = [r.problem for r in recommendations] + summary.improvements
    resources = get_personalized_resources(
        learning_topics=learning_topics,
        weaknesses=weakness_texts,
        max_resources=6
    )

    # 6. Metadata and Formatting
    duration_ms = int((time.time() - start_time) * 1000)
    metadata = AnalysisMetadata(
        model=Config.GEMINI_MODEL,
        processingTimeMs=duration_ms,
        timestamp=datetime.now(timezone.utc).isoformat(),
        schemaVersion="2.0"
    )

    markdown_critique = render_markdown_critique(summary, scores, recommendations)

    return FullCritiqueResponse(
        schemaVersion="2.0",
        analysisId=analysis_id,
        image=dimensions,
        summary=summary,
        scores=scores,
        recommendations=recommendations,
        learningTopics=learning_topics,
        cvMetrics=cv_metrics,
        exifData=exif_data,
        resources=resources,
        metadata=metadata,
        fullCritiqueMarkdown=markdown_critique
    )
