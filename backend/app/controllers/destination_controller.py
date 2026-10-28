from typing import Optional
from flask import request, jsonify, Response
from app.repositories.destination_repository import DestinationRepository


class DestinationController:
    """Handles destination data queries."""

    @classmethod
    def get_destinations(cls) -> Response:
        """Fetch all destinations, with optional state, type, and keyword query params."""
        state = request.args.get("state")
        dest_type = request.args.get("type")
        search = request.args.get("search")

        destinations = DestinationRepository.get_all(
            state=state,
            destination_type=dest_type,
            search=search,
        )

        return jsonify({
            "success": True,
            "count": len(destinations),
            "destinations": [d.model_dump() for d in destinations],
        }), 200

    @classmethod
    def get_destination_by_id(cls, destination_id: str) -> Response:
        """Fetch a single destination record by ID or return 404."""
        dest = DestinationRepository.get_by_id(destination_id)
        if not dest:
            return jsonify({
                "success": False,
                "error": "Destination not found",
                "message": f"No destination found with identifier '{destination_id}'.",
            }), 404

        return jsonify({
            "success": True,
            "destination": dest.model_dump(),
        }), 200
