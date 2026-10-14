"""
Image handling and validation utilities for ArtiSight 2.0.
Protects against decompression bombs, validates image integrity,
handles orientation normalization, and ensures temporary file cleanup.
"""

import os
import uuid
import logging
import math
from contextlib import contextmanager
from pathlib import Path
from PIL import Image, ImageOps

from app.config import Config

logger = logging.getLogger(__name__)

# Protect against decompression bomb attacks while allowing high-res photos
Image.MAX_IMAGE_PIXELS = 100_000_000  # 100 Megapixels max


def allowed_file(filename: str) -> bool:
    """Check if filename has an allowed extension and a valid basename."""
    if not filename or "." not in filename:
        return False
    parts = filename.rsplit(".", 1)
    if not parts[0].strip():
        return False
    return parts[1].lower() in Config.ALLOWED_EXTENSIONS


def generate_unique_filename(original_filename: str) -> str:
    """Generate a collision-resistant unique filename."""
    ext = "jpg"
    if original_filename and "." in original_filename:
        ext = original_filename.rsplit(".", 1)[1].lower()
        if ext not in Config.ALLOWED_EXTENSIONS:
            ext = "jpg"
    return f"{uuid.uuid4().hex}.{ext}"


def validate_image_file(file_path: str) -> bool:
    """
    Validate that the file contains genuine, decodable image data.
    Ensures the image is not corrupted or an invalid binary payload.
    """
    try:
        with Image.open(file_path) as img:
            img.verify()
        # verify() leaves the file pointer at the end; re-open to check if loadable
        with Image.open(file_path) as img:
            img.load()
            if img.width < 10 or img.height < 10:
                logger.warning(f"Image too small: {img.width}x{img.height}")
                return False
        return True
    except Exception as e:
        logger.warning(f"Image validation failed for {file_path}: {e}")
        return False


def normalize_image_orientation(file_path: str) -> None:
    """
    Normalizes image orientation in-place based on EXIF orientation metadata
    so that downstream OpenCV and PIL processing evaluate the correct visual orientation.
    """
    try:
        with Image.open(file_path) as img:
            transposed = ImageOps.exif_transpose(img)
            if transposed is not None and transposed != img:
                transposed.save(file_path)
                logger.info(f"Normalized orientation for {file_path}")
    except Exception as e:
        logger.debug(f"Orientation normalization skipped: {e}")


def calculate_aspect_ratio(width: int, height: int) -> str:
    """Calculate the simplified aspect ratio string."""
    if width <= 0 or height <= 0:
        return "Unknown"
    gcd = math.gcd(width, height)
    w_ratio = width // gcd
    h_ratio = height // gcd
    
    # Common standard photography aspect ratios
    decimal = round(width / height, 2)
    standard_ratios = {
        1.0: "1:1 Square",
        1.33: "4:3 Standard",
        1.5: "3:2 Classical 35mm",
        1.78: "16:9 Widescreen",
        2.39: "21:9 Anamorphic",
        0.75: "3:4 Portrait",
        0.67: "2:3 Portrait 35mm",
        0.56: "9:16 Vertical Story"
    }
    for target, label in standard_ratios.items():
        if abs(decimal - target) < 0.05:
            return label
            
    return f"{w_ratio}:{h_ratio}"


def get_image_dimensions(file_path: str) -> dict:
    """Extract width, height, and human-readable aspect ratio."""
    with Image.open(file_path) as img:
        width, height = img.size
        aspect_ratio = calculate_aspect_ratio(width, height)
        return {
            "width": width,
            "height": height,
            "aspectRatio": aspect_ratio
        }


def cleanup_file(file_path: str) -> None:
    """Safely remove a temporary file from disk."""
    if not file_path:
        return
    try:
        path = Path(file_path)
        if path.exists() and path.is_file():
            path.unlink()
            logger.info(f"Cleaned up temporary file: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to delete temp file {file_path}: {e}")


@contextmanager
def temporary_upload(file_obj, upload_folder: str, filename: str):
    """
    Context manager to save an incoming file to disk and ensure
    it is cleaned up upon exiting the block, even if an exception occurs.
    """
    unique_name = generate_unique_filename(filename)
    dest_path = os.path.join(upload_folder, unique_name)
    file_obj.save(dest_path)
    try:
        yield dest_path
    finally:
        cleanup_file(dest_path)
