import pytest
from app.models.destination import Destination
from app.services.budget_service import BudgetService


@pytest.fixture
def sample_destination():
    return Destination(
        destination_id="test_dest",
        name="Test Hilltop",
        state="Uttarakhand",
        description="A beautiful alpine hill station surrounded by pine forests.",
        destination_types=["mountains", "nature"],
        attractions=["Pine Viewpoint", "Lake"],
        travel_tips=["Carry warm clothes"],
        best_season="March to June",
        accommodation_cost=1000.0,
        food_cost=400.0,
        local_transport_cost=200.0,
        activity_cost=300.0,
        intercity_transport_cost=500.0,
        estimated_cost_confidence="high",
        cost_last_verified="2025-01",
        source_urls=["https://example.com/test"],
    )


@pytest.fixture
def incomplete_destination():
    return Destination(
        destination_id="incomplete_dest",
        name="Mystery Beach",
        state="Goa",
        description="Unverified secluded cove.",
        destination_types=["beaches"],
        attractions=["Secret Cove"],
        travel_tips=[],
        best_season="All year",
        accommodation_cost=None,  # Missing cost!
        food_cost=500.0,
        local_transport_cost=None,  # Missing cost!
        activity_cost=200.0,
        intercity_transport_cost=None,
        estimated_cost_confidence="low",
        cost_last_verified=None,
        source_urls=[],
    )


def test_budget_calculation_solo_traveller(sample_destination):
    """Test 1 person for 3 days on budget style."""
    breakdown, status, warnings = BudgetService.calculate_destination_budget(
        destination=sample_destination,
        duration_days=3,
        travellers=1,
        travel_style="budget",
        user_budget=10000.0,
    )

    # 1 traveller needs 1 room: ceil(1/2) = 1
    # Accommodation: 1 room * 1000 * 3 = 3000
    # Food: 1 traveller * 400 * 3 = 1200
    # Local: 1 traveller * 200 * 3 = 600
    # Activity: 1 traveller * 300 * 3 = 900
    # Intercity: 1 traveller * 500 = 500
    # Total: 3000 + 1200 + 600 + 900 + 500 = 6200
    assert breakdown.rooms_needed == 1
    assert breakdown.accommodation_cost == 3000.0
    assert breakdown.food_cost == 1200.0
    assert breakdown.local_transport_cost == 600.0
    assert breakdown.activity_cost == 900.0
    assert breakdown.intercity_transport_cost == 500.0
    assert breakdown.total_cost == 6200.0
    assert breakdown.cost_per_person == 6200.0
    assert status == "within_budget"


def test_shared_accommodation_two_travellers(sample_destination):
    """Test 2 persons sharing 1 room: ceil(2/2) = 1 room."""
    breakdown, status, warnings = BudgetService.calculate_destination_budget(
        destination=sample_destination,
        duration_days=2,
        travellers=2,
        travel_style="budget",
        user_budget=10000.0,
    )

    assert breakdown.rooms_needed == 1
    # Accommodation: 1 room * 1000 * 2 = 2000
    # Food: 2 * 400 * 2 = 1600
    # Local: 2 * 200 * 2 = 800
    # Activity: 2 * 300 * 2 = 1200
    # Intercity: 2 * 500 = 1000
    # Total: 2000 + 1600 + 800 + 1200 + 1000 = 6600
    assert breakdown.accommodation_cost == 2000.0
    assert breakdown.food_cost == 1600.0
    assert breakdown.total_cost == 6600.0
    assert breakdown.cost_per_person == 3300.0
    assert status == "within_budget"


def test_shared_accommodation_odd_travellers(sample_destination):
    """Test 3 persons: ceil(3/2) = 2 rooms required."""
    breakdown, status, warnings = BudgetService.calculate_destination_budget(
        destination=sample_destination,
        duration_days=1,
        travellers=3,
        travel_style="budget",
    )

    assert breakdown.rooms_needed == 2
    # 2 rooms * 1000 * 1 = 2000
    assert breakdown.accommodation_cost == 2000.0


def test_over_budget_detection(sample_destination):
    """When budget is lower than estimated cost, mark exceeds_budget."""
    breakdown, status, warnings = BudgetService.calculate_destination_budget(
        destination=sample_destination,
        duration_days=5,
        travellers=2,
        user_budget=3000.0,  # Clearly too low
    )

    assert status == "exceeds_budget"
    assert breakdown.total_cost > 3000.0


def test_unknown_expenses_marked_incomplete(incomplete_destination):
    """Missing or null costs must NEVER be treated as free (0 INR) and must flag incomplete_data."""
    breakdown, status, warnings = BudgetService.calculate_destination_budget(
        destination=incomplete_destination,
        duration_days=3,
        travellers=2,
        user_budget=50000.0,
    )

    assert status == "incomplete_data"
    assert len(warnings) > 0
    assert any("Accommodation cost is missing" in w for w in warnings)
    assert any("Local transport expense is missing" in w for w in warnings)


def test_travel_style_multipliers(sample_destination):
    """Luxury style increases rates appropriately."""
    breakdown_budget, _, _ = BudgetService.calculate_destination_budget(
        destination=sample_destination,
        duration_days=2,
        travellers=1,
        travel_style="budget",
    )
    breakdown_luxury, _, _ = BudgetService.calculate_destination_budget(
        destination=sample_destination,
        duration_days=2,
        travellers=1,
        travel_style="luxury",
    )

    assert breakdown_luxury.total_cost > breakdown_budget.total_cost
    assert breakdown_luxury.accommodation_cost > breakdown_budget.accommodation_cost


def test_alternative_advice():
    """Verify suggestions generated when budget is insufficient."""
    advice = BudgetService.generate_alternatives_advice(
        user_budget=5000.0,
        duration_days=5,
        travellers=2,
        lowest_available_cost=8500.0,
    )

    assert len(advice) >= 3
    assert any("Increase your total budget" in a for a in advice)
    assert any("Reduce your trip duration" in a for a in advice)
