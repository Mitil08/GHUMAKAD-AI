from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DayItinerary(BaseModel):
    """Itinerary structure for a single day."""
    day: int
    title: str
    morning: str
    afternoon: str
    evening: str
    estimated_daily_cost: float
    tips: Optional[str] = None


class ExpenseBreakdown(BaseModel):
    """Structured breakdown of trip expenses."""
    accommodation_cost: float
    food_cost: float
    local_transport_cost: float
    activity_cost: float
    intercity_transport_cost: float
    total_cost: float
    cost_per_person: float
    rooms_needed: int
    notes: List[str] = Field(default_factory=list)


class DestinationRecommendation(BaseModel):
    """Complete recommendation card for a single destination."""
    destination_id: str
    name: str
    state: str
    description: str
    match_reason: str
    budget_status: str = Field(..., description="'within_budget', 'exceeds_budget', or 'incomplete_data'")
    total_estimated_cost: float
    cost_per_person: float
    expense_breakdown: ExpenseBreakdown
    major_attractions: List[str]
    travel_tips: List[str]
    best_season: str
    day_wise_itinerary: List[DayItinerary]
    missing_data_warnings: List[str] = Field(default_factory=list)
    source_urls: List[str] = Field(default_factory=list)
    confidence: str = "high"


class RecommendationResponse(BaseModel):
    """Top-level recommendation response envelope."""
    success: bool = True
    query: Dict[str, Any]
    summary: str
    budget_feasible: bool
    recommendations: List[DestinationRecommendation]
    suggestions_if_unfeasible: List[str] = Field(default_factory=list)
    disclaimer: str = (
        "Estimates are calculated using realistic baseline tariffs and verified regional averages. "
        "Seasonal fluctuations, booking surges, and personal shopping are not included."
    )
