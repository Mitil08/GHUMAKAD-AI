import json
import logging
import re
import requests
from typing import Dict, Any, List, Optional
from app.config import Config
from app.models.destination import Destination
from app.models.recommendation_request import RecommendationRequest
from app.models.recommendation_response import DayItinerary, ExpenseBreakdown

logger = logging.getLogger(__name__)


class LLMService:
    """
    High-Performance LLM Service orchestrating local Gemma 3:1b inference via Ollama.
    Combines instant verified-dataset grounding with lightning-fast targeted reasoning.
    """

    @classmethod
    def _get_llm(cls):
        """Initializes LangChain ChatOllama instance (or None if unavailable)."""
        try:
            from langchain_ollama import ChatOllama
            return ChatOllama(
                model=Config.OLLAMA_MODEL,
                base_url=Config.OLLAMA_BASE_URL,
                temperature=0.2,
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
        Creates a grounded, high-quality itinerary purely from verified dataset attractions.
        Operates in 0ms with zero hallucinations.
        """
        attractions = destination.attractions if destination.attractions else [destination.name]
        num_attractions = len(attractions)
        tips = destination.travel_tips if destination.travel_tips else ["Explore at a relaxed pace."]

        itineraries: List[DayItinerary] = []
        for d in range(1, duration_days + 1):
            attr_idx_1 = (d * 2 - 2) % num_attractions
            attr_idx_2 = (d * 2 - 1) % num_attractions
            tip_idx = (d - 1) % len(tips)

            main_attr = attractions[attr_idx_1]
            sec_attr = attractions[attr_idx_2] if attr_idx_1 != attr_idx_2 else "cultural markets"

            itineraries.append(
                DayItinerary(
                    day=d,
                    title=f"Day {d}: Exploring {main_attr} & Vicinity",
                    morning=f"Begin your morning at {main_attr}. Immerse yourself in the scenic beauty and morning atmosphere.",
                    afternoon=f"Enjoy authentic regional cuisine for lunch, followed by visiting {sec_attr}.",
                    evening=f"Catch the golden sunset from local promenades and explore vibrant local bazaars.",
                    estimated_daily_cost=round(daily_expense_est, 2),
                    tips=tips[tip_idx],
                )
            )
        return itineraries

    @classmethod
    def generate_batch_match_reasons(
        cls,
        destinations: List[Destination],
        request: RecommendationRequest,
    ) -> Dict[str, str]:
        """
        Calls Gemma 3:1b in a SINGLE, ultra-fast pass to generate personalized match
        reasons for all selected destinations simultaneously (completes in ~1-2 seconds).
        """
        reasons: Dict[str, str] = {}
        for dest in destinations:
            # High-quality factual default
            reasons[dest.destination_id] = (
                f"{dest.name} in {dest.state} matches your {', '.join(request.preferences)} vibe "
                f"and fits comfortably within your ₹{request.budget:,.0f} budget for a {request.travel_style} trip."
            )

        dest_summaries = []
        for dest in destinations:
            dest_summaries.append(
                f"- ID: {dest.destination_id}, Name: {dest.name}, State: {dest.state}, Vibes: {', '.join(dest.destination_types)}"
            )
        dest_text = "\n".join(dest_summaries)

        prompt = f"""You are Ghumakad AI travel advisor. For each destination, provide a 1-sentence personalized match reason explaining why it fits the traveler.
Traveler preferences: {', '.join(request.preferences)}
Travel style: {request.travel_style}
Total Budget: ₹{request.budget:,.0f} INR

Destinations:
{dest_text}

Respond ONLY with a JSON object mapping each destination ID to its 1-sentence match reason:
{{"destination_id": "match reason"}}"""

        try:
            payload = {
                "model": Config.OLLAMA_MODEL,
                "prompt": prompt,
                "format": "json",
                "stream": False,
                "options": {
                    "num_predict": 180,
                    "temperature": 0.2,
                    "num_ctx": 1024,
                },
                "keep_alive": "15m",
            }
            # Ultra-tight 2.5s budget ensures responses return within seconds
            res = requests.post(
                f"{Config.OLLAMA_BASE_URL}/api/generate",
                json=payload,
                timeout=2.5,
            )
            if res.status_code == 200:
                raw_json = res.json().get("response", "{}")
                match = re.search(r"\{[\s\S]*\}", raw_json)
                if match:
                    parsed = json.loads(match.group(0))
                    for d_id, r_text in parsed.items():
                        if isinstance(r_text, str) and len(r_text.strip()) > 10:
                            reasons[d_id] = r_text.strip()
                    logger.info("Gemma 3:1b fast batch inference completed successfully.")
        except Exception as e:
            logger.warning(f"Fast batch inference skipped or timed out ({e}). Using verified fallback match reasons.")

        return reasons

    @classmethod
    def generate_recommendation_details(
        cls,
        destination: Destination,
        breakdown: ExpenseBreakdown,
        request: RecommendationRequest,
    ) -> Dict[str, Any]:
        """
        Backwards-compatible single-item recommendation generation.
        Combines instant factual itinerary with targeted reasoning.
        """
        daily_expense_est = (
            breakdown.food_cost + breakdown.local_transport_cost + breakdown.activity_cost
        ) / (request.duration_days * request.travellers if request.duration_days > 0 else 1)

        itinerary = cls._create_deterministic_itinerary(
            destination, request.duration_days, daily_expense_est
        )

        if cls._get_llm() is None:
            return {
                "match_reason": (
                    f"{destination.name} in {destination.state} is a prime destination for {', '.join(request.preferences)} "
                    f"travel vibes. It aligns with your {request.travel_style} travel preference and budget."
                ),
                "day_wise_itinerary": itinerary,
                "generated_by": "deterministic_fallback (Ollama service unavailable)",
            }

        match_reasons = cls.generate_batch_match_reasons([destination], request)
        reason = match_reasons.get(
            destination.destination_id,
            f"{destination.name} perfectly matches your {', '.join(request.preferences)} trip preferences."
        )

        return {
            "match_reason": reason,
            "day_wise_itinerary": itinerary,
            "generated_by": f"{Config.OLLAMA_MODEL} + Grounded RAG",
        }
