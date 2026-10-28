from flask import Blueprint
from app.controllers.destination_controller import DestinationController

destination_bp = Blueprint("destinations", __name__)

destination_bp.route("/destinations", methods=["GET"])(
    DestinationController.get_destinations
)
destination_bp.route("/destinations/<destination_id>", methods=["GET"])(
    DestinationController.get_destination_by_id
)
