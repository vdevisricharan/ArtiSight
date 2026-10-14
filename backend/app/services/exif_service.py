"""
EXIF metadata extraction service for ArtiSight 2.0.
Extracts camera, lens, and exposure settings while stripping GPS data for user privacy.
"""

import logging
from typing import Optional
from PIL import Image, ExifTags
from app.schemas.critique_schema import ExifMetadata

logger = logging.getLogger(__name__)


def format_exposure_time(val) -> Optional[str]:
    """Convert shutter speed / exposure time to standard photographic fraction."""
    try:
        if val is None:
            return None
        float_val = float(val)
        if float_val <= 0:
            return None
        if float_val < 1.0:
            # Fraction format, e.g. 1/250s
            reciprocal = round(1.0 / float_val)
            return f"1/{reciprocal}s"
        elif float_val.is_integer():
            return f"{int(float_val)}s"
        else:
            return f"{float_val:.1f}s"
    except Exception:
        return str(val)


def format_fnumber(val) -> Optional[str]:
    """Convert aperture to standard f-number format, e.g. f/2.8."""
    try:
        if val is None:
            return None
        float_val = float(val)
        if float_val.is_integer():
            return f"f/{int(float_val)}"
        return f"f/{float_val:.1f}"
    except Exception:
        return str(val)


def format_focal_length(val) -> Optional[str]:
    """Convert focal length to standard mm format, e.g. 50mm."""
    try:
        if val is None:
            return None
        float_val = float(val)
        if float_val.is_integer():
            return f"{int(float_val)}mm"
        return f"{float_val:.1f}mm"
    except Exception:
        return str(val)


def extract_exif_metadata(image_path: str) -> ExifMetadata:
    """
    Extract technical capture metadata from an image file.
    Does not extract or retain GPS latitude/longitude/altitude data.
    """
    try:
        with Image.open(image_path) as img:
            raw_exif = img.getexif()
            if not raw_exif:
                return ExifMetadata(hasExif=False)

            # Map tag IDs to tag names
            exif_data = {}
            for tag_id, value in raw_exif.items():
                tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                # Explicit privacy guard: never store GPSInfo
                if tag_name == "GPSInfo":
                    continue
                exif_data[tag_name] = value

            # Also check Exif IFD sub-table if available
            try:
                for ifd_id in (ExifTags.IFD.Exif, ExifTags.IFD.MakerNote):
                    ifd_data = raw_exif.get_ifd(ifd_id)
                    if ifd_data:
                        for tag_id, value in ifd_data.items():
                            tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                            if tag_name != "GPSInfo":
                                exif_data[tag_name] = value
            except Exception:
                pass

            camera_make = str(exif_data.get("Make", "")).strip() or None
            camera_model = str(exif_data.get("Model", "")).strip() or None
            lens_model = str(exif_data.get("LensModel", "")).strip() or None
            focal_length = format_focal_length(exif_data.get("FocalLength"))
            aperture = format_fnumber(exif_data.get("FNumber"))
            shutter_speed = format_exposure_time(exif_data.get("ExposureTime"))
            iso_val = exif_data.get("ISOSpeedRatings") or exif_data.get("PhotographicSensitivity")
            iso = str(iso_val) if iso_val else None
            capture_date = str(exif_data.get("DateTimeOriginal") or exif_data.get("DateTime", "")).strip() or None
            software = str(exif_data.get("Software", "")).strip() or None

            has_meaningful_exif = bool(
                camera_make or camera_model or focal_length or aperture or shutter_speed or iso
            )

            return ExifMetadata(
                hasExif=has_meaningful_exif,
                cameraMake=camera_make,
                cameraModel=camera_model,
                lensModel=lens_model,
                focalLength=focal_length,
                aperture=aperture,
                shutterSpeed=shutter_speed,
                iso=iso,
                captureDate=capture_date,
                software=software,
            )
    except Exception as e:
        logger.debug(f"Failed to extract EXIF from {image_path}: {e}")
        return ExifMetadata(hasExif=False)
