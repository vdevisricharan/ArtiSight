"""
ArtiSight 2.0 Backend Application Factory.
Initializes Flask, CORS, Swagger documentation, error handlers, and route blueprints.
"""

import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flasgger import Swagger
from app.config import Config
from app.api.routes import api_bp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("artisight")


def create_app(config_class=Config) -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Validate configuration and log any non-fatal notices
    warnings = Config.validate()
    for w in warnings:
        logger.info(f"Notice: {w}")

    # Configure CORS
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=False
    )

    # Swagger Documentation
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "ArtiSight 2.0 API",
            "description": "Multimodal AI photo critique, OpenCV deterministic signals, EXIF metadata extraction, and personalized photography learning recommendations.",
            "version": "2.0.0"
        },
        "schemes": ["http", "https"],
        "consumes": ["application/json", "multipart/form-data"],
        "produces": ["application/json"]
    }
    Swagger(app, template=swagger_template)

    # Register blueprints
    app.register_blueprint(api_bp)

    # Global Error Handlers
    @app.errorhandler(413)
    def handle_large_file(error):
        mb_limit = Config.MAX_FILE_SIZE // (1024 * 1024)
        return jsonify({"error": f"Image file exceeds server limit ({mb_limit}MB). Please upload a smaller image."}), 413

    @app.errorhandler(400)
    def handle_bad_request(error):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def handle_server_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({"error": "An internal server error occurred. Please try again."}), 500

    logger.info(f"ArtiSight 2.0 initialized. Model: {Config.GEMINI_MODEL} | Environment: {Config.FLASK_ENV}")
    return app
