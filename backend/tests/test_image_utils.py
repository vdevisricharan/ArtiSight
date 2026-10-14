"""Unit tests for image handling utilities."""

import os
import tempfile
from PIL import Image
from app.utils.image_utils import (
    allowed_file,
    generate_unique_filename,
    validate_image_file,
    calculate_aspect_ratio,
    cleanup_file,
    get_image_dimensions
)


def test_allowed_file():
    assert allowed_file("photo.jpg") is True
    assert allowed_file("photo.JPEG") is True
    assert allowed_file("photo.png") is True
    assert allowed_file("photo.webp") is True
    assert allowed_file("photo.exe") is False
    assert allowed_file("photo.txt") is False
    assert allowed_file(".jpg") is False
    assert allowed_file("") is False


def test_calculate_aspect_ratio():
    assert "16:9" in calculate_aspect_ratio(1920, 1080)
    assert "1:1" in calculate_aspect_ratio(1000, 1000)
    assert "3:2" in calculate_aspect_ratio(6000, 4000)
    assert "4:3" in calculate_aspect_ratio(4000, 3000)


def test_validate_image_file():
    # 1. Valid test image
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = tmp.name
        img = Image.new("RGB", (200, 150), color="blue")
        img.save(tmp_path)

    try:
        assert validate_image_file(tmp_path) is True
        dims = get_image_dimensions(tmp_path)
        assert dims["width"] == 200
        assert dims["height"] == 150
    finally:
        cleanup_file(tmp_path)
        assert not os.path.exists(tmp_path)

    # 2. Corrupted / Fake image
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        fake_path = tmp.name
        tmp.write(b"NOT_A_REAL_IMAGE_DATA_12345")

    try:
        assert validate_image_file(fake_path) is False
    finally:
        cleanup_file(fake_path)
