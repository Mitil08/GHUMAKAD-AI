import logging
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.routes.health_routes import health_bp
from app.routes.destination_routes import destination_bp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def create_app(config_class=Config) -> Flask:
    """Application factory for Ghumakad AI Flask Backend."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend origin
    CORS(
        app,
        resources={r"/api/*": {"origins": [config_class.FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"]}},
        supports_credentials=True,
    )

    # Register blueprints under /api/v1
    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(destination_bp, url_prefix="/api/v1")

    # Import and register recommendation blueprint
    try:
        from app.routes.recommendation_routes import recommendation_bp
        app.register_blueprint(recommendation_bp, url_prefix="/api/v1")
    except ImportError:
        logger.warning("Recommendation routes not loaded yet.")

    # Global error handlers (JSON formatted)
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": str(error.description if hasattr(error, 'description') else error),
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "The requested API endpoint was not found.",
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "success": False,
            "error": "Method Not Allowed",
            "message": "HTTP method not allowed for this route.",
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({
            "success": False,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request.",
        }), 500

    logger.info("Ghumakad AI Flask app initialized successfully.")
    return app
