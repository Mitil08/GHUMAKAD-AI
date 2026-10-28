import pytest
import json
from unittest.mock import patch
from app import create_app
from app.config import Config
from app.models.destination import Destination
from app.models.recommendation_request import RecommendationRequest
from app.models.recommendation_response import DayItinerary
from app.services.retrieval_service import RetrievalService
from app.services.llm_service import LLMService


@pytest.fixture
def client():
    app = create_app(Config)
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_llm_response():
    """Mock for expensive LLM inference in fast unit tests."""
    def _mock(destination, breakdown, request):
        return {
            "match_reason": f"Excellent match for {destination.name}.",
            "day_wise_itinerary": [
                DayItinerary(
                    day=i + 1,
                    title=f"Day {i + 1}: Highlights of {destination.name}",
                    morning="Morning exploration of key monuments.",
                    afternoon="Afternoon local culinary dining and bazaars.",
                    evening="Evening sunset viewpoints and relaxation.",
                    estimated_daily_cost=round(breakdown.total_cost / request.duration_days, 2),
                    tips="Wear comfortable footwear.",
                )
                for i in range(request.duration_days)
            ],
            "generated_by": "mock_test_fixture",
        }
    return _mock


# 1. Health endpoint
def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.get_json()
    assert "status" in data
    assert "components" in data
    assert data["components"]["api"]["status"] == "operational"


# 2. Valid recommendation request
def test_valid_recommendation_request(client, mock_llm_response):
    payload = {
        "budget": 20000,
        "duration_days": 3,
        "preferences": ["mountains", "adventure"],
        "departure_location": "Bhopal, Madhya Pradesh",
        "travellers": 2,
        "travel_style": "budget",
    }
    with patch.object(LLMService, "generate_recommendation_details", side_effect=mock_llm_response):
        response = client.post(
            "/api/v1/recommendations",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert "recommendations" in data
        assert len(data["recommendations"]) > 0
        rec = data["recommendations"][0]
        assert "name" in rec
        assert "total_estimated_cost" in rec
        assert "expense_breakdown" in rec
        assert "day_wise_itinerary" in rec
        assert len(rec["day_wise_itinerary"]) == 3


# 3. Missing budget
def test_missing_budget(client):
    payload = {
        "duration_days": 3,
        "preferences": ["beaches"],
        "departure_location": "Mumbai",
        "travellers": 2,
    }
    response = client.post(
        "/api/v1/recommendations",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "Validation Error" in data["error"]


# 4. Negative budget
def test_negative_budget(client):
    payload = {
        "budget": -5000,
        "duration_days": 3,
        "preferences": ["beaches"],
        "departure_location": "Mumbai",
        "travellers": 2,
    }
    response = client.post(
        "/api/v1/recommendations",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False


# 5. Invalid trip duration
def test_invalid_duration(client):
    payload = {
        "budget": 10000,
        "duration_days": 35,
        "preferences": ["beaches"],
        "departure_location": "Mumbai",
        "travellers": 2,
    }
    response = client.post(
        "/api/v1/recommendations",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False


# 6. Invalid traveller count
def test_invalid_traveller_count(client):
    payload = {
        "budget": 10000,
        "duration_days": 3,
        "preferences": ["beaches"],
        "departure_location": "Mumbai",
        "travellers": 0,
    }
    response = client.post(
        "/api/v1/recommendations",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False


# 7. Non-JSON request
def test_non_json_request(client):
    response = client.post(
        "/api/v1/recommendations",
        data="this is plain text",
        content_type="text/plain",
    )
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False


# 8. Over-budget scenario generates alternatives advice
def test_over_budget_generates_advice(client, mock_llm_response):
    payload = {
        "budget": 500,
        "duration_days": 5,
        "preferences": ["mountains"],
        "departure_location": "Delhi",
        "travellers": 4,
    }
    with patch.object(LLMService, "generate_recommendation_details", side_effect=mock_llm_response):
        response = client.post(
            "/api/v1/recommendations",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["success"] is True
        assert data["budget_feasible"] is False
        assert len(data["suggestions_if_unfeasible"]) > 0


# 9. Retrieval service vector & fallback retrieval
def test_destination_retrieval():
    req = RecommendationRequest(
        budget=15000,
        duration_days=3,
        preferences=["beaches"],
        departure_location="Bengaluru",
        travellers=2,
    )
    results = RetrievalService.retrieve_destinations(req, top_k=5)
    assert len(results) > 0
    dests = [d.name.lower() for d, _ in results]
    assert any("goa" in n or "gokarna" in n or "varkala" in n for n in dests)


# 10. Ollama unavailable fallback handling
def test_ollama_unavailable_fallback():
    sample_dest = Destination(
        destination_id="mock_01",
        name="Mock Paradise",
        state="Goa",
        description="A beautiful coastline with golden sand.",
        destination_types=["beaches"],
        attractions=["Golden Shore"],
        travel_tips=["Wear sunscreen"],
        best_season="November to February",
        accommodation_cost=1500,
        food_cost=500,
        local_transport_cost=300,
        activity_cost=200,
        intercity_transport_cost=500,
    )
    req = RecommendationRequest(
        budget=15000,
        duration_days=2,
        preferences=["beaches"],
        departure_location="Mumbai",
    )
    from app.services.budget_service import BudgetService
    breakdown, _, _ = BudgetService.calculate_destination_budget(
        sample_dest, 2, 1, "budget"
    )

    with patch.object(LLMService, "_get_llm", return_value=None):
        result = LLMService.generate_recommendation_details(sample_dest, breakdown, req)
        assert "match_reason" in result
        assert "day_wise_itinerary" in result
        assert len(result["day_wise_itinerary"]) == 2
        assert "deterministic_fallback" in result["generated_by"]
