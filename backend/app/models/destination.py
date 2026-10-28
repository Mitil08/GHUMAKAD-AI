from typing import List, Optional
from pydantic import BaseModel, Field


class Destination(BaseModel):
    """Pydantic model representing a verified destination record."""

    destination_id: str = Field(..., description="Unique identifier for the destination")
    name: str = Field(..., min_length=1, description="Destination name")
    state: str = Field(..., min_length=1, description="Indian state or union territory")
    description: str = Field(..., min_length=10, description="Overview and cultural/natural vibe")
    destination_types: List[str] = Field(default_factory=list, description="Categories e.g. beaches, mountains")
    attractions: List[str] = Field(default_factory=list, description="Key monuments, landmarks, viewpoints")
    travel_tips: List[str] = Field(default_factory=list, description="Practical travel advice")
    best_season: str = Field(..., description="Recommended travel window")
    accommodation_cost: Optional[float] = Field(None, description="Average cost per room per night in INR")
    food_cost: Optional[float] = Field(None, description="Average cost per person per day in INR")
    local_transport_cost: Optional[float] = Field(None, description="Average cost per person per day in INR")
    activity_cost: Optional[float] = Field(None, description="Average activity & entry fees per person per day in INR")
    intercity_transport_cost: Optional[float] = Field(None, description="Estimated baseline round-trip transit in INR")
    estimated_cost_confidence: str = Field(default="high", description="high, medium, or low confidence")
    cost_last_verified: Optional[str] = Field(None, description="YYYY-MM of price verification")
    source_urls: List[str] = Field(default_factory=list, description="Official tourism and source links")
