"""
WSGI entrypoint for ArtiSight 2.0 backend.
Usage:
- Local development: python run.py
- Production (Gunicorn): gunicorn -w 2 -b 0.0.0.0:5000 run:app
"""

from app import create_app
from app.config import Config

app = create_app()

if __name__ == "__main__":
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
