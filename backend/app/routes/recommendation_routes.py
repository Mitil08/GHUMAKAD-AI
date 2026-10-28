from flask import Blueprint
from app.controllers.recommendation_controller import RecommendationController

recommendation_bp = Blueprint("recommendations", __name__)

recommendation_bp.route("/recommendations", methods=["POST"])(
    RecommendationController.get_recommendations
)
