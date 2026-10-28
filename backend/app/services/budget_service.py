import math
from typing import Dict, Any, List, Optional, Tuple
from app.models.destination import Destination
from app.models.recommendation_response import ExpenseBreakdown


class BudgetService:
    """
    Dedicated deterministic budget calculation service.

    Core Calculation Formula:
    -------------------------
    1. Accommodation (Shared):
       - Assumes standard double occupancy (2 persons per room).
       - rooms_needed = ceil(travellers / 2)
       - total_accommodation = rooms_needed * accommodation_cost_per_night * duration_days * style_multiplier

    2. Food & Dining:
       - Cost per person per day.
       - total_food = travellers * food_cost_per_day * duration_days * style_multiplier

    3. Local Transport:
       - Cost per person per day (autos, local taxis, metro, shared vehicles).
       - total_local_transport = travellers * local_transport_cost_per_day * duration_days * style_multiplier

    4. Activities & Sightseeing:
       - Entry tickets, permits, guides, experiences.
       - total_activities = travellers * activity_cost_per_day * duration_days * style_multiplier

    5. Intercity Transport:
       - Baseline estimated transit to/from the destination per traveller.
       - total_intercity = travellers * intercity_cost_per_person
       - If unknown, explicitly flagged as incomplete / unverified.

    Never treat missing numerical costs as zero (free).
    """

    STYLE_MULTIPLIERS = {
        "budget": 1.0,
        "mid-range": 1.45,
        "luxury": 2.25,
    }

    @classmethod
    def calculate_destination_budget(
        cls,
        destination: Destination,
        duration_days: int,
        travellers: int,
        travel_style: str = "budget",
        user_budget: Optional[float] = None,
    ) -> Tuple[ExpenseBreakdown, str, List[str]]:
        """
        Calculates trip budget for a given destination and parameters.

        Returns:
            Tuple[ExpenseBreakdown, budget_status, missing_warnings]
            budget_status is one of: 'within_budget', 'exceeds_budget', 'incomplete_data'
        """
        multiplier = cls.STYLE_MULTIPLIERS.get(travel_style.lower(), 1.0)
        missing_warnings: List[str] = []
        is_complete = True
        notes: List[str] = []

        # 1. Rooms and Accommodation
        rooms_needed = math.ceil(travellers / 2)
        if destination.accommodation_cost is not None and destination.accommodation_cost > 0:
            room_rate = destination.accommodation_cost * multiplier
            total_accommodation = round(rooms_needed * room_rate * duration_days, 2)
            notes.append(
                f"Accommodation: {rooms_needed} room(s) @ ₹{room_rate:.0f}/night for {duration_days} day(s)."
            )
        else:
            total_accommodation = 0.0
            is_complete = False
            missing_warnings.append("Accommodation cost is missing or unverified.")

        # 2. Food
        if destination.food_cost is not None and destination.food_cost > 0:
            food_rate = destination.food_cost * multiplier
            total_food = round(travellers * food_rate * duration_days, 2)
            notes.append(
                f"Food: ₹{food_rate:.0f}/person/day for {travellers} traveller(s) over {duration_days} day(s)."
            )
        else:
            total_food = 0.0
            is_complete = False
            missing_warnings.append("Daily food expense is missing or unverified.")

        # 3. Local Transport
        if destination.local_transport_cost is not None and destination.local_transport_cost > 0:
            local_rate = destination.local_transport_cost * multiplier
            total_local_transport = round(travellers * local_rate * duration_days, 2)
            notes.append(
                f"Local transit: ₹{local_rate:.0f}/person/day for {travellers} traveller(s)."
            )
        else:
            total_local_transport = 0.0
            is_complete = False
            missing_warnings.append("Local transport expense is missing or unverified.")

        # 4. Activities & Sightseeing
        if destination.activity_cost is not None and destination.activity_cost >= 0:
            activity_rate = destination.activity_cost * (1.2 if travel_style == "luxury" else 1.0)
            total_activities = round(travellers * activity_rate * duration_days, 2)
            notes.append(
                f"Activities & entry: ₹{activity_rate:.0f}/person/day for {duration_days} day(s)."
            )
        else:
            total_activities = 0.0
            missing_warnings.append("Activity expenses are estimated or variable.")

        # 5. Intercity Transport
        if destination.intercity_transport_cost is not None and destination.intercity_transport_cost > 0:
            intercity_rate = destination.intercity_transport_cost * (
                1.6 if travel_style == "luxury" else 1.0
            )
            total_intercity = round(travellers * intercity_rate, 2)
            notes.append(
                f"Intercity transit baseline: ₹{intercity_rate:.0f}/person for {travellers} traveller(s)."
            )
        else:
            total_intercity = 0.0
            missing_warnings.append(
                "Intercity transit depends on exact departure station/mode and is estimated separately."
            )

        # Total Cost
        total_cost = round(
            total_accommodation
            + total_food
            + total_local_transport
            + total_activities
            + total_intercity,
            2,
        )
        cost_per_person = round(total_cost / travellers, 2) if travellers > 0 else total_cost

        # Determine budget status
        if not is_complete:
            budget_status = "incomplete_data"
        elif user_budget is not None:
            if total_cost <= user_budget:
                budget_status = "within_budget"
            else:
                budget_status = "exceeds_budget"
        else:
            budget_status = "within_budget"

        breakdown = ExpenseBreakdown(
            accommodation_cost=total_accommodation,
            food_cost=total_food,
            local_transport_cost=total_local_transport,
            activity_cost=total_activities,
            intercity_transport_cost=total_intercity,
            total_cost=total_cost,
            cost_per_person=cost_per_person,
            rooms_needed=rooms_needed,
            notes=notes,
        )

        return breakdown, budget_status, missing_warnings

    @classmethod
    def generate_alternatives_advice(
        cls,
        user_budget: float,
        duration_days: int,
        travellers: int,
        lowest_available_cost: Optional[float] = None,
    ) -> List[str]:
        """Generates realistic suggestions when no destination fits the budget."""
        suggestions = []
        if lowest_available_cost and lowest_available_cost > user_budget:
            gap = int(lowest_available_cost - user_budget)
            suggestions.append(
                f"Increase your total budget by at least ₹{gap:,} to match the most affordable verified destination."
            )

        if duration_days > 2:
            new_days = max(2, duration_days - 1)
            suggestions.append(
                f"Reduce your trip duration from {duration_days} days to {new_days} days to cut lodging and daily meal costs."
            )

        if travellers > 1:
            per_person = round(user_budget / travellers)
            suggestions.append(
                f"Your current budget works out to ₹{per_person:,} per person. Consider travelling in off-season (monsoons/shoulder months) for discounted homestays."
            )

        suggestions.append(
            "Opt for train sleeper class or government intercity bus services to dramatically lower transport overhead."
        )
        return suggestions
