"""Unit tests for EXIF metadata service."""

import os
import tempfile
from PIL import Image
from app.services.exif_service import (
    extract_exif_metadata,
    format_exposure_time,
    format_fnumber,
    format_focal_length,
)
from app.utils.image_utils import cleanup_file


def test_format_helpers():
    assert format_exposure_time(0.004) == "1/250s"
    assert format_exposure_time(2.0) == "2s"
    assert format_fnumber(2.8) == "f/2.8"
    assert format_fnumber(4.0) == "f/4"
    assert format_focal_length(50.0) == "50mm"
    assert format_focal_length(85.5) == "85.5mm"


def test_exif_extraction_no_exif():
    # Freshly generated PIL image has no EXIF
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = tmp.name
        img = Image.new("RGB", (100, 100), color="red")
        img.save(tmp_path)

    try:
        exif = extract_exif_metadata(tmp_path)
        assert exif.hasExif is False
        assert exif.cameraMake is None
    finally:
        cleanup_file(tmp_path)
