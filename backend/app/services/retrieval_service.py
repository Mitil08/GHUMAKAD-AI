import logging
from pathlib import Path
from typing import List, Tuple, Optional
from app.config import Config
from app.models.destination import Destination
from app.models.recommendation_request import RecommendationRequest
from app.repositories.destination_repository import DestinationRepository

logger = logging.getLogger(__name__)

COLLECTION_NAME = "ghumakad_destinations"


class RetrievalService:
    """
    RAG semantic retrieval service using ChromaDB.
    Combines vector search with structured filtering and deterministic fallback.
    """

    _client = None
    _collection = None

    @classmethod
    def _init_chroma(cls):
        """Initializes connection to the ChromaDB vector store."""
        if cls._collection is not None:
            return cls._collection

        try:
            import chromadb
            from scripts.build_vector_store import get_embedding_function, build_vector_store

            persist_dir = Path(Config.CHROMADB_DIR)
            if not persist_dir.exists() or not any(persist_dir.iterdir()):
                logger.info("ChromaDB vector store not found. Building vector store...")
                build_vector_store(force_rebuild=False)

            cls._client = chromadb.PersistentClient(path=str(persist_dir))
            embedding_fn = get_embedding_function()
            cls._collection = cls._client.get_collection(
                name=COLLECTION_NAME,
                embedding_function=embedding_fn,
            )
            logger.info("ChromaDB collection successfully connected.")
            return cls._collection
        except Exception as e:
            logger.warning(f"Could not connect to ChromaDB: {e}. Semantic retrieval will use structured fallback.")
            return None

    @classmethod
    def retrieve_destinations(
        cls,
        request: RecommendationRequest,
        top_k: int = 6,
    ) -> List[Tuple[Destination, float]]:
        """
        Retrieves relevant destinations based on semantic similarity to preferences,
        supplemented by structured filters.

        Returns:
            List of (Destination, relevance_score) tuples.
        """
        collection = cls._init_chroma()

        # Build semantic search query
        pref_str = ", ".join(request.preferences)
        query_text = (
            f"Looking for travel destinations matching vibes: {pref_str}. "
            f"Travel style: {request.travel_style}. "
            f"Trip duration: {request.duration_days} days. "
            f"Origin: {request.departure_location}."
        )

        results: List[Tuple[Destination, float]] = []

        if collection:
            try:
                query_response = collection.query(
                    query_texts=[query_text],
                    n_results=min(top_k * 2, 20),
                    include=["metadatas", "distances"],
                )

                ids = query_response.get("ids", [[]])[0]
                distances = query_response.get("distances", [[]])[0]

                for dest_id, dist in zip(ids, distances):
                    dest = DestinationRepository.get_by_id(dest_id)
                    if dest:
                        # Cosine distance: lower is more similar; convert to similarity score 0-1
                        similarity = max(0.0, 1.0 - float(dist)) if dist is not None else 0.8
                        results.append((dest, similarity))

                if results:
                    logger.info(f"Retrieved {len(results)} destinations via ChromaDB vector similarity.")
                    return results[:top_k]
            except Exception as e:
                logger.warning(f"Vector search failed ({e}). Reverting to keyword/attribute ranking.")

        # Deterministic structured fallback
        all_dests = DestinationRepository.get_all()
        scored_dests: List[Tuple[Destination, float]] = []

        user_prefs_lower = [p.lower() for p in request.preferences]

        for d in all_dests:
            score = 0.0
            # Category match
            for p in user_prefs_lower:
                for dt in d.destination_types:
                    if p in dt.lower() or dt.lower() in p:
                        score += 0.4
                if p in d.description.lower():
                    score += 0.2
                if any(p in a.lower() for a in d.attractions):
                    score += 0.15

            # Base score for all destinations to allow discovery
            if score == 0:
                score = 0.1

            scored_dests.append((d, min(1.0, score)))

        # Sort descending by relevance score
        scored_dests.sort(key=lambda x: x[1], reverse=True)
        return scored_dests[:top_k]
