import logging
from flask import request, jsonify, Response
from pydantic import ValidationError
from app.models.recommendation_request import RecommendationRequest
from app.services.recommendation_service import RecommendationService

logger = logging.getLogger(__name__)


class RecommendationController:
    """Controller for processing user recommendation requests."""

    @classmethod
    def get_recommendations(cls) -> Response:
        """
        POST /api/v1/recommendations
        Validates request payload and returns structured destination recommendations.
        """
        if not request.is_json:
            return jsonify({
                "success": False,
                "error": "Invalid Content-Type",
                "message": "Request body must be valid JSON.",
            }), 400

        payload = request.get_json(silent=True)
        if payload is None:
            return jsonify({
                "success": False,
                "error": "Malformed JSON",
                "message": "Could not parse JSON in request body.",
            }), 400

        # Validate with Pydantic model
        try:
            req_data = RecommendationRequest(**payload)
        except ValidationError as e:
            errors = []
            for err in e.errors():
                loc = ".".join(str(l) for l in err.get("loc", []))
                msg = err.get("msg", "Invalid value")
                errors.append(f"{loc}: {msg}")
            return jsonify({
                "success": False,
                "error": "Validation Error",
                "message": "Invalid travel preference parameters provided.",
                "details": errors,
            }), 400
        except Exception as e:
            return jsonify({
                "success": False,
                "error": "Validation Error",
                "message": str(e),
            }), 400

        try:
            response_data = RecommendationService.get_recommendations(req_data)
            return jsonify(response_data.model_dump()), 200
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}", exc_info=True)
            return jsonify({
                "success": False,
                "error": "Recommendation Generation Failed",
                "message": "An error occurred while generating recommendations. Please try again.",
            }), 500
