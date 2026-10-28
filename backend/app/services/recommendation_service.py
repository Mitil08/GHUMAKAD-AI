import logging
from typing import List, Dict, Any, Optional
from app.models.destination import Destination
from app.models.recommendation_request import RecommendationRequest
from app.models.recommendation_response import (
    RecommendationResponse,
    DestinationRecommendation,
    ExpenseBreakdown,
)
from app.services.budget_service import BudgetService
from app.services.retrieval_service import RetrievalService
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class RecommendationService:
    """
    Main orchestration service coordinating semantic retrieval,
    budget enforcement, and grounded LLM itinerary generation.
    """

    @classmethod
    def get_recommendations(cls, request: RecommendationRequest) -> RecommendationResponse:
        """
        Orchestrates full recommendation workflow:
        1. Semantic retrieval from ChromaDB / structured index.
        2. Deterministic budget calculation for all candidates.
        3. Strict budget partitioning and ranking.
        4. LLM grounded itinerary generation for top candidates.
        5. Alternative advice generation if no destinations fit budget.
        """
        # Step 1: Semantic retrieval
        retrieved_candidates = RetrievalService.retrieve_destinations(request, top_k=6)
        if not retrieved_candidates:
            logger.warning("No destinations retrieved. Falling back to all destinations.")
            from app.repositories.destination_repository import DestinationRepository
            all_dests = DestinationRepository.get_all()
            retrieved_candidates = [(d, 0.5) for d in all_dests[:6]]

        # Step 2: Calculate deterministic budgets
        processed_destinations = []
        for dest, relevance in retrieved_candidates:
            breakdown, budget_status, warnings = BudgetService.calculate_destination_budget(
                destination=dest,
                duration_days=request.duration_days,
                travellers=request.travellers,
                travel_style=request.travel_style,
                user_budget=request.budget,
            )
            processed_destinations.append({
                "destination": dest,
                "relevance": relevance,
                "breakdown": breakdown,
                "budget_status": budget_status,
                "warnings": warnings,
            })

        # Step 3: Prioritize within-budget destinations
        affordable = [p for p in processed_destinations if p["budget_status"] == "within_budget"]
        over_budget = [p for p in processed_destinations if p["budget_status"] == "exceeds_budget"]
        incomplete = [p for p in processed_destinations if p["budget_status"] == "incomplete_data"]

        # Sort affordable by relevance score (descending), then by cost
        affordable.sort(key=lambda x: (x["relevance"], -x["breakdown"].total_cost), reverse=True)
        over_budget.sort(key=lambda x: x["breakdown"].total_cost)

        budget_feasible = len(affordable) > 0
        suggestions_if_unfeasible = []

        if budget_feasible:
            # Pick top affordable destinations (up to 3)
            selected = affordable[:3]
            # If we have space, we can include 1 closest runner-up marked clearly as exceeds_budget
            if len(selected) < 3 and over_budget:
                selected.append(over_budget[0])
            summary = (
                f"Discovered {len(affordable)} destination(s) perfectly fitting your "
                f"budget of ₹{request.budget:,.0f} for {request.duration_days} day(s)."
            )
        else:
            # Nothing in budget
            selected = over_budget[:3] if over_budget else incomplete[:3]
            lowest_cost = over_budget[0]["breakdown"].total_cost if over_budget else None
            suggestions_if_unfeasible = BudgetService.generate_alternatives_advice(
                user_budget=request.budget,
                duration_days=request.duration_days,
                travellers=request.travellers,
                lowest_available_cost=lowest_cost,
            )
            summary = (
                f"Your budget of ₹{request.budget:,.0f} is lower than the verified minimum cost "
                f"for the selected trip duration and group size. Showing closest available options with cost breakdown."
            )

        # Step 4: Generate Grounded Itineraries via LLM / Gemma 3:1b
        recommendations: List[DestinationRecommendation] = []
        for item in selected:
            dest = item["destination"]
            breakdown = item["breakdown"]
            status = item["budget_status"]
            warnings = item["warnings"]

            # Call LLM Service
            ai_data = LLMService.generate_recommendation_details(
                destination=dest,
                breakdown=breakdown,
                request=request,
            )

            rec_card = DestinationRecommendation(
                destination_id=dest.destination_id,
                name=dest.name,
                state=dest.state,
                description=dest.description,
                match_reason=ai_data.get("match_reason", ""),
                budget_status=status,
                total_estimated_cost=breakdown.total_cost,
                cost_per_person=breakdown.cost_per_person,
                expense_breakdown=breakdown,
                major_attractions=dest.attractions,
                travel_tips=dest.travel_tips,
                best_season=dest.best_season,
                day_wise_itinerary=ai_data.get("day_wise_itinerary", []),
                missing_data_warnings=warnings,
                source_urls=dest.source_urls,
                confidence=dest.estimated_cost_confidence,
            )
            recommendations.append(rec_card)

        # Step 5: Construct complete response envelope
        return RecommendationResponse(
            success=True,
            query=request.model_dump(),
            summary=summary,
            budget_feasible=budget_feasible,
            recommendations=recommendations,
            suggestions_if_unfeasible=suggestions_if_unfeasible,
        )
