import logging
import requests
from pathlib import Path
from flask import jsonify, Response
from app.config import Config

logger = logging.getLogger(__name__)


class HealthController:
    """Handles health and readiness verification."""

    @classmethod
    def check_health(cls) -> Response:
        """
        Reports backend availability, distinguishing between basic API health
        and AI/Vector DB readiness.
        """
        backend_status = "healthy"
        ollama_reachable = False
        model_available = False
        vector_store_ready = False

        # 1. Check Ollama server and configured model
        try:
            resp = requests.get(f"{Config.OLLAMA_BASE_URL}/api/tags", timeout=3)
            if resp.status_code == 200:
                ollama_reachable = True
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                # Match e.g. "gemma3:1b" or "gemma3:1b-..."
                model_target = Config.OLLAMA_MODEL.lower()
                model_available = any(model_target in m.lower() for m in models)
        except Exception as e:
            logger.debug(f"Ollama health check notice: {e}")

        # 2. Check Vector Store
        chroma_path = Path(Config.CHROMADB_DIR)
        if chroma_path.exists() and any(chroma_path.iterdir()):
            vector_store_ready = True

        # AI Readiness status
        ai_ready = ollama_reachable and model_available and vector_store_ready

        payload = {
            "status": "ready" if ai_ready else "degraded",
            "api_version": "v1",
            "service": "Ghumakad AI Backend",
            "components": {
                "api": {
                    "status": "operational",
                    "code": 200,
                },
                "ollama": {
                    "status": "operational" if ollama_reachable else "unavailable",
                    "base_url": Config.OLLAMA_BASE_URL,
                },
                "model": {
                    "name": Config.OLLAMA_MODEL,
                    "status": "loaded" if model_available else "missing",
                },
                "vector_store": {
                    "status": "initialized" if vector_store_ready else "not_built",
                    "directory": str(Config.CHROMADB_DIR),
                },
            },
            "ai_ready": ai_ready,
        }

        # Return 200 even if AI is degraded, but clearly state operational vs degraded in payload
        return jsonify(payload), 200
