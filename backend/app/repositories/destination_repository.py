import json
import logging
from pathlib import Path
from typing import List, Optional
from app.models.destination import Destination
from app.config import Config

logger = logging.getLogger(__name__)


class DestinationRepository:
    """Repository for accessing structured destination records."""

    _destinations: Optional[List[Destination]] = None

    @classmethod
    def _load_data(cls) -> List[Destination]:
        if cls._destinations is not None:
            return cls._destinations

        data_path = Path(Config.DESTINATIONS_DATA_PATH)
        if not data_path.exists():
            logger.error(f"Destinations file not found at: {data_path}")
            cls._destinations = []
            return cls._destinations

        try:
            with open(data_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)

            valid_destinations: List[Destination] = []
            for item in raw_data:
                try:
                    dest = Destination(**item)
                    valid_destinations.append(dest)
                except Exception as e:
                    logger.warning(f"Skipping invalid destination record {item.get('name', 'Unknown')}: {e}")

            cls._destinations = valid_destinations
            logger.info(f"Loaded {len(cls._destinations)} validated destinations.")
            return cls._destinations
        except Exception as e:
            logger.error(f"Failed to load destinations dataset: {e}")
            cls._destinations = []
            return cls._destinations

    @classmethod
    def get_all(
        cls,
        state: Optional[str] = None,
        destination_type: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Destination]:
        """Fetch all destinations with optional state, type, and keyword filtering."""
        records = cls._load_data()
        filtered = records

        if state:
            state_query = state.strip().lower()
            filtered = [d for d in filtered if d.state.lower() == state_query]

        if destination_type:
            type_query = destination_type.strip().lower()
            filtered = [
                d for d in filtered
                if any(type_query in dt.lower() for dt in d.destination_types)
            ]

        if search:
            q = search.strip().lower()
            filtered = [
                d for d in filtered
                if (
                    q in d.name.lower()
                    or q in d.state.lower()
                    or q in d.description.lower()
                    or any(q in a.lower() for a in d.attractions)
                    or any(q in t.lower() for t in d.destination_types)
                )
            ]

        return filtered

    @classmethod
    def get_by_id(cls, destination_id: str) -> Optional[Destination]:
        """Fetch a specific destination by its unique ID."""
        records = cls._load_data()
        target_id = destination_id.strip().lower()
        for dest in records:
            if dest.destination_id.lower() == target_id:
                return dest
        return None

    @classmethod
    def reload(cls) -> List[Destination]:
        """Force reload from disk (useful for testing or cache updates)."""
        cls._destinations = None
        return cls._load_data()
