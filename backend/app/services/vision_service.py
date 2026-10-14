"""
OpenCV deterministic computer vision service for ArtiSight 2.0.
Computes objective photographic signals:
- Luminance distribution & exposure histogram
- Highlight and shadow clipping percentages
- RMS tonal contrast
- Laplacian edge variance sharpness metric
- Dominant color representation
"""

import logging
import cv2
import numpy as np
from app.schemas.critique_schema import OpenCVAnalysis

logger = logging.getLogger(__name__)


def compute_opencv_metrics(image_path: str) -> OpenCVAnalysis:
    """
    Perform deterministic OpenCV image analysis.
    Provides mathematical signals that complement the generative LLM critique.
    """
    # Read image in BGR
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        raise ValueError(f"OpenCV could not decode image at {image_path}")

    # Convert to grayscale for luminance & edge analysis
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    total_pixels = gray.size

    # 1. Brightness & Contrast
    mean_val = float(np.mean(gray))
    std_val = float(np.std(gray))  # RMS Contrast

    # 2. Clipping indicators
    # Highlights: pixels with luminance > 250
    # Shadows: pixels with luminance < 5
    highlight_clipped = np.count_nonzero(gray > 250)
    shadow_clipped = np.count_nonzero(gray < 5)

    highlight_pct = round((highlight_clipped / total_pixels) * 100.0, 2)
    shadow_pct = round((shadow_clipped / total_pixels) * 100.0, 2)

    # Exposure evaluation
    if highlight_pct > 5.0 and shadow_pct > 5.0:
        exposure_eval = "High Dynamic Range with both highlight and shadow clipping."
    elif highlight_pct > 5.0:
        exposure_eval = "Highlight clipping detected; potential overexposure in sky or specular reflections."
    elif shadow_pct > 5.0:
        exposure_eval = "Shadow clipping detected; deep crushed blacks in underexposed regions."
    elif 100 <= mean_val <= 155:
        exposure_eval = "Well-balanced midtone exposure across the frame."
    elif mean_val < 100:
        exposure_eval = "Low-key / moody lighting with dominant darker tones."
    else:
        exposure_eval = "High-key illumination with dominant bright tones."

    # 3. Sharpness estimation (Variance of Laplacian)
    # Note: High-frequency edge energy. Low values can indicate camera blur OR intentional shallow DOF / bokeh.
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    variance_laplacian = float(laplacian.var())
    rounded_sharpness = round(variance_laplacian, 1)

    if rounded_sharpness > 500:
        sharpness_eval = "Very sharp edge definition across prominent scene details."
    elif rounded_sharpness > 150:
        sharpness_eval = "Good overall focus and discernible edge sharpness."
    elif rounded_sharpness > 50:
        sharpness_eval = "Moderate edge definition; may feature soft focus, motion, or intentional shallow depth of field."
    else:
        sharpness_eval = "Soft image structure; potential motion blur, defocus, or low-resolution capture."

    # 4. Downsampled 32-bin luminance histogram for web display
    hist = cv2.calcHist([gray], [0], None, [32], [0, 256])
    # Normalize histogram to 0-100 scale for UI rendering
    max_hist = float(np.max(hist)) if np.max(hist) > 0 else 1.0
    hist_norm = [int(round(float(count) / max_hist * 100)) for count in hist.flatten()]

    # 5. Dominant color extraction via k-means downsampling (small thumbnail)
    small_bgr = cv2.resize(img_bgr, (64, 64), interpolation=cv2.INTER_AREA)
    small_rgb = cv2.cvtColor(small_bgr, cv2.COLOR_BGR2RGB)
    avg_color = np.mean(small_rgb, axis=(0, 1)).astype(int)
    hex_color = f"#{avg_color[0]:02x}{avg_color[1]:02x}{avg_color[2]:02x}"

    return OpenCVAnalysis(
        sharpnessIndex=rounded_sharpness,
        sharpnessAssessment=sharpness_eval,
        brightnessMean=round(mean_val, 1),
        contrastRms=round(std_val, 1),
        highlightClippingPercent=highlight_pct,
        shadowClippingPercent=shadow_pct,
        exposureEvaluation=exposure_eval,
        luminanceHistogram=hist_norm,
        dominantColorHex=hex_color,
    )
