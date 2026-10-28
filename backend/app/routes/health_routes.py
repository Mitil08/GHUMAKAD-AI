from flask import Blueprint
from app.controllers.health_controller import HealthController

health_bp = Blueprint("health", __name__)

health_bp.route("/health", methods=["GET"])(HealthController.check_health)
