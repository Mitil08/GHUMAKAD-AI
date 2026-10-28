import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.config import Config
from app.models.destination import Destination
from app.models.recommendation_request import RecommendationRequest
from app.models.recommendation_response import DayItinerary, ExpenseBreakdown

logger = logging.getLogger(__name__)


class LLMService:
    """
    Service for orchestrating local LLM inference via LangChain and Ollama (Gemma 3:1b).
    Enforces strict grounding, schema validation, and transparent failure fallbacks.
    """

    @classmethod
    def _get_llm(cls):
        """Initializes LangChain ChatOllama instance."""
        try:
            from langchain_ollama import ChatOllama
            return ChatOllama(
                model=Config.OLLAMA_MODEL,
                base_url=Config.OLLAMA_BASE_URL,
                temperature=0.3,
                timeout=Config.OLLAMA_TIMEOUT_SECONDS,
            )
        except Exception as e:
            logger.warning(f"Could not initialize ChatOllama ({e}).")
            return None

    @classmethod
    def _create_deterministic_itinerary(
        cls,
        destination: Destination,
        duration_days: int,
        daily_expense_est: float,
    ) -> List[DayItinerary]:
        """
        Creates a grounded, high-quality itinerary purely from verified dataset attractions
        when Gemma 3:1b is unavailable, times out, or returns invalid syntax.
        """
        attractions = destination.attractions if destination.attractions else [destination.name]
        num_attractions = len(attractions)
        tips = destination.travel_tips if destination.travel_tips else ["Explore at a relaxed pace."]

        itineraries: List[DayItinerary] = []
        for d in range(1, duration_days + 1):
            attr_idx_1 = (d * 2 - 2) % num_attractions
            attr_idx_2 = (d * 2 - 1) % num_attractions
            tip_idx = (d - 1) % len(tips)

            itineraries.append(
                DayItinerary(
                    day=d,
                    title=f"Day {d}: Exploring {attractions[attr_idx_1]} & Vicinity",
                    morning=f"Begin the day visiting {attractions[attr_idx_1]}. Soak in the morning atmosphere and local surroundings.",
                    afternoon=f"Relish local regional specialties for lunch, then explore {attractions[attr_idx_2] if attr_idx_1 != attr_idx_2 else 'nearby cultural landmarks'}.",
                    evening=f"Unwind with a stroll around scenic vantage points and local markets. Enjoy evening dinner.",
                    estimated_daily_cost=round(daily_expense_est, 2),
                    tips=tips[tip_idx],
                )
            )
        return itineraries

    @classmethod
    def generate_recommendation_details(
        cls,
        destination: Destination,
        breakdown: ExpenseBreakdown,
        request: RecommendationRequest,
    ) -> Dict[str, Any]:
        """
        Calls Gemma 3:1b via LangChain Ollama to generate grounded match reasoning
        and customized day-wise itineraries.
        """
        daily_expense_est = (
            breakdown.food_cost + breakdown.local_transport_cost + breakdown.activity_cost
        ) / (request.duration_days * request.travellers if request.duration_days > 0 else 1)

        llm = cls._get_llm()
        if not llm:
            logger.info("Ollama/LangChain unavailable. Using verified deterministic itinerary.")
            return {
                "match_reason": (
                    f"{destination.name} in {destination.state} is a prime destination for {', '.join(request.preferences)} "
                    f"travel vibes. It aligns with your {request.travel_style} travel preference and budget."
                ),
                "day_wise_itinerary": cls._create_deterministic_itinerary(
                    destination, request.duration_days, daily_expense_est
                ),
                "generated_by": "deterministic_fallback (Ollama service unavailable)",
            }

        # Structured Prompt
        system_instruction = (
            "You are Ghumakad AI's travel itinerary assistant. "
            "You MUST use ONLY the verified destination information provided below. "
            "DO NOT invent places, attractions, prices, or transit distances. "
            "You MUST respond ONLY with a single valid JSON object, without backticks or markdown."
        )

        user_prompt = f"""
DESTINATION CONTEXT:
Name: {destination.name}
State: {destination.state}
Vibe/Types: {', '.join(destination.destination_types)}
Description: {destination.description}
Verified Attractions: {', '.join(destination.attractions)}
Travel Tips: {', '.join(destination.travel_tips)}
Best Season: {destination.best_season}

USER TRIP DETAILS:
Budget: ₹{request.budget:,.0f} INR
Duration: {request.duration_days} days
Travellers: {request.travellers}
Travel Style: {request.travel_style}
Departure From: {request.departure_location}
Preferences: {', '.join(request.preferences)}

TASK:
1. Write a match_reason (2-3 sentences explaining why this matches their preferences).
2. Write a day-wise itinerary for exactly {request.duration_days} days, using the verified attractions above.

JSON OUTPUT FORMAT (Strict):
{{
  "match_reason": "string",
  "days": [
    {{
      "day": 1,
      "title": "string",
      "morning": "string",
      "afternoon": "string",
      "evening": "string",
      "tips": "string"
    }}
  ]
}}
"""

        try:
            from langchain_core.messages import SystemMessage, HumanMessage

            messages = [
                SystemMessage(content=system_instruction),
                HumanMessage(content=user_prompt),
            ]

            response = llm.invoke(messages)
            content = response.content.strip()

            # Clean JSON formatting (strip ```json ... ``` if present)
            json_match = re.search(r"\{[\s\S]*\}", content)
            if json_match:
                content = json_match.group(0)

            parsed = json.loads(content)

            match_reason = parsed.get("match_reason", "")
            raw_days = parsed.get("days", [])

            itineraries: List[DayItinerary] = []
            for d_item in raw_days:
                day_num = int(d_item.get("day", len(itineraries) + 1))
                itineraries.append(
                    DayItinerary(
                        day=day_num,
                        title=d_item.get("title", f"Day {day_num} in {destination.name}"),
                        morning=d_item.get("morning", "Explore local heritage and sights."),
                        afternoon=d_item.get("afternoon", "Enjoy authentic local cuisine and shopping."),
                        evening=d_item.get("evening", "Sunset views and relaxation."),
                        estimated_daily_cost=round(daily_expense_est, 2),
                        tips=d_item.get("tips", destination.travel_tips[0] if destination.travel_tips else None),
                    )
                )

            # Ensure day count matches duration
            if len(itineraries) != request.duration_days:
                logger.warning(
                    f"LLM generated {len(itineraries)} days instead of {request.duration_days}. Adjusting..."
                )
                itineraries = cls._create_deterministic_itinerary(
                    destination, request.duration_days, daily_expense_est
                )

            return {
                "match_reason": match_reason or f"Great match for {destination.name}.",
                "day_wise_itinerary": itineraries,
                "generated_by": f"Ollama {Config.OLLAMA_MODEL}",
            }

        except Exception as e:
            logger.warning(f"Ollama/Gemma generation failed or timed out ({e}). Using deterministic fallback.")
            return {
                "match_reason": (
                    f"{destination.name} in {destination.state} offers exceptional {', '.join(destination.destination_types)} "
                    f"experiences tailored to your {request.travel_style} adventure from {request.departure_location}."
                ),
                "day_wise_itinerary": cls._create_deterministic_itinerary(
                    destination, request.duration_days, daily_expense_est
                ),
                "generated_by": "deterministic_fallback (Ollama inference error)",
            }
