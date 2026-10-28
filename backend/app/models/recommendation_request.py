from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class RecommendationRequest(BaseModel):
    """Validation schema for user travel recommendation queries."""

    budget: float = Field(..., gt=0, description="Total trip budget in INR across all travellers")
    duration_days: int = Field(..., ge=1, le=30, description="Trip duration in days (1 to 30)")
    preferences: List[str] = Field(..., min_length=1, description="List of preferred vibes/types")
    departure_location: str = Field(..., min_length=2, description="City or origin location")
    travellers: int = Field(default=1, ge=1, le=20, description="Number of travellers (1 to 20)")
    travel_style: str = Field(default="budget", description="Style: budget, mid-range, or luxury")

    @field_validator("budget")
    @classmethod
    def validate_budget_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Budget must be a positive number greater than 0.")
        return v

    @field_validator("duration_days")
    @classmethod
    def validate_duration(cls, v: int) -> int:
        if v < 1 or v > 30:
            raise ValueError("Trip duration must be between 1 and 30 days.")
        return v

    @field_validator("travellers")
    @classmethod
    def validate_travellers(cls, v: int) -> int:
        if v < 1 or v > 20:
            raise ValueError("Number of travellers must be between 1 and 20.")
        return v

    @field_validator("preferences")
    @classmethod
    def validate_preferences(cls, v: List[str]) -> List[str]:
        cleaned = [p.strip().lower() for p in v if p and p.strip()]
        if not cleaned:
            raise ValueError("At least one travel preference must be specified.")
        return cleaned

    @field_validator("departure_location")
    @classmethod
    def validate_departure(cls, v: str) -> str:
        trimmed = v.strip()
        if len(trimmed) < 2:
            raise ValueError("Departure location must be at least 2 characters long.")
        return trimmed

    @field_validator("travel_style")
    @classmethod
    def validate_travel_style(cls, v: str) -> str:
        style = v.strip().lower()
        if style not in ("budget", "mid-range", "luxury"):
            return "budget"
        return style
