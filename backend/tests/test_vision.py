"""Unit tests for OpenCV vision service."""

import os
import tempfile
import numpy as np
import cv2
from app.services.vision_service import compute_opencv_metrics
from app.utils.image_utils import cleanup_file


def test_opencv_metrics_calculation():
    # Create a synthetic image with known gradient and sharp edge
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    # White rectangle in center for sharp edges and highlights
    img[100:200, 100:200] = 255
    # Dark area on left for shadow clipping test
    img[0:50, 0:50] = 2

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name
        cv2.imwrite(tmp_path, img)

    try:
        metrics = compute_opencv_metrics(tmp_path)
        assert metrics.brightnessMean > 0
        assert metrics.contrastRms > 0
        assert metrics.sharpnessIndex > 0
        assert len(metrics.luminanceHistogram) == 32
        assert metrics.dominantColorHex.startswith("#")
        assert metrics.highlightClippingPercent > 0
        assert metrics.shadowClippingPercent > 0
    finally:
        cleanup_file(tmp_path)
