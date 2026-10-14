"""
Pydantic schemas and typed data contracts for ArtiSight 2.0.
Provides versioned, validated data contracts for photography critique,
OpenCV technical analysis, EXIF metadata, and personalized learning recommendations.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class ImageDimensions(BaseModel):
    width: int = Field(..., description="Image width in pixels", ge=1)
    height: int = Field(..., description="Image height in pixels", ge=1)
    aspectRatio: str = Field(default="Unknown", description="Human-readable aspect ratio (e.g. 16:9, 3:2, 1:1)")


class ScoreDimension(BaseModel):
    value: float = Field(..., description="Rubric score on a 0-10 scale", ge=0.0, le=10.0)
    rationale: str = Field(..., description="Pedagogical explanation for this score")

    @field_validator("value", mode="before")
    @classmethod
    def round_score(cls, v):
        try:
            return round(float(v), 1)
        except (ValueError, TypeError):
            return 5.0


class CategoryScores(BaseModel):
    composition: ScoreDimension
    lighting: ScoreDimension
    focus: ScoreDimension
    color: ScoreDimension
    storytelling: ScoreDimension
    overall: ScoreDimension


class CritiqueSummary(BaseModel):
    title: str = Field(..., description="Descriptive critique headline")
    observations: List[str] = Field(default_factory=list, description="Initial visual observations")
    strengths: List[str] = Field(default_factory=list, description="Key artistic and technical strengths")
    improvements: List[str] = Field(default_factory=list, description="Primary areas for improvement")


class ActionableRecommendation(BaseModel):
    problem: str = Field(..., description="Specific weakness or challenge identified")
    evidence: str = Field(..., description="Direct visual evidence in the photograph")
    why_it_matters: str = Field(..., description="Core photographic principle explained")
    recommendation: str = Field(..., description="Concrete shooting or editing technique to apply")
    exercise: str = Field(..., description="Practical hands-on shooting assignment")
    expected_outcome: str = Field(..., description="Specific skill developed upon completion")
    learning_topic: str = Field(..., description="Categorical skill tag (e.g., Leading Lines, ETTR)")


class OpenCVAnalysis(BaseModel):
    sharpnessIndex: float = Field(..., description="Laplacian variance sharpness estimator")
    sharpnessAssessment: str = Field(..., description="Qualitative sharpness classification")
    brightnessMean: float = Field(..., description="Mean pixel luminance (0-255)")
    contrastRms: float = Field(..., description="Root-mean-square tonal contrast")
    highlightClippingPercent: float = Field(..., description="Percentage of overexposed pixels (>250)")
    shadowClippingPercent: float = Field(..., description="Percentage of underexposed pixels (<5)")
    exposureEvaluation: str = Field(..., description="Objective assessment of exposure balance")
    luminanceHistogram: List[int] = Field(default_factory=list, description="Downsampled 32-bin luminance histogram")
    dominantColorHex: Optional[str] = Field(default=None, description="Dominant tone hex code")


class ExifMetadata(BaseModel):
    hasExif: bool = Field(default=False, description="Whether EXIF tags were present")
    cameraMake: Optional[str] = None
    cameraModel: Optional[str] = None
    lensModel: Optional[str] = None
    focalLength: Optional[str] = None
    aperture: Optional[str] = None
    shutterSpeed: Optional[str] = None
    iso: Optional[str] = None
    captureDate: Optional[str] = None
    flash: Optional[str] = None
    software: Optional[str] = None


class LearningResource(BaseModel):
    title: str
    link: str
    snippet: str
    displayLink: str
    sourceType: str = Field(default="article", description="tutorial, video, article, or guide")
    thumbnail: Optional[str] = None
    searchQuery: Optional[str] = None


class AnalysisMetadata(BaseModel):
    model: str = Field(..., description="Multimodal model identifier used for inference")
    processingTimeMs: int = Field(..., description="Total analysis duration in milliseconds")
    timestamp: str = Field(..., description="ISO 8601 generation timestamp")
    schemaVersion: str = Field(default="2.0")


class FullCritiqueResponse(BaseModel):
    schemaVersion: str = Field(default="2.0")
    analysisId: str = Field(..., description="Unique UUID for this analysis session")
    image: ImageDimensions
    summary: CritiqueSummary
    scores: CategoryScores
    recommendations: List[ActionableRecommendation] = Field(default_factory=list)
    learningTopics: List[str] = Field(default_factory=list)
    cvMetrics: OpenCVAnalysis
    exifData: ExifMetadata
    resources: List[LearningResource] = Field(default_factory=list)
    metadata: AnalysisMetadata
    fullCritiqueMarkdown: Optional[str] = Field(
        default=None,
        description="Markdown rendered summary for backward compatibility and text export"
    )
