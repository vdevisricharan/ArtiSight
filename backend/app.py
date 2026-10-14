"""
ArtiSight 2.0 Backend Entrypoint (Backward Compatibility).
Imports application factory from app package.
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