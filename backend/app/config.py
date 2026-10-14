"""
Configuration module for ArtiSight 2.0 backend.
Handles environment variables, default settings, and service readiness.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

# Base directories
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")


class Config:
    """Application configuration."""

    # Server settings
    FLASK_ENV = os.getenv("FLASK_ENV", "production")
    DEBUG = FLASK_ENV == "development"
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "0.0.0.0")

    # File uploads
    UPLOAD_FOLDER = str(BACKEND_DIR / "temp_uploads")
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
    MAX_FILE_SIZE = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))  # 16 MB

    # Model settings
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Search credentials (optional)
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")
    SEARCH_ENABLED = bool(GOOGLE_API_KEY and GOOGLE_CSE_ID)

    # CORS
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://artisight.netlify.app"
        ).split(",")
        if origin.strip()
    ]

    @classmethod
    def validate(cls):
        """Verify essential configuration. Returns boolean and any warning messages."""
        warnings = []
        if not cls.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is required for ArtiSight. Please set it in backend/.env"
            )

        if not cls.SEARCH_ENABLED:
            warnings.append(
                "Google Custom Search API credentials (GOOGLE_API_KEY / GOOGLE_CSE_ID) not fully set. "
                "The engine will use the verified curated photographic learning resource library."
            )

        Path(cls.UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)
        return warnings
