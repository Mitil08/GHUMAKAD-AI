import os
from pathlib import Path
from dotenv import load_dotenv

# Base backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env
env_path = BACKEND_DIR / ".env"
load_dotenv(dotenv_path=env_path)


class Config:
    """Application configuration."""

    FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
    FLASK_HOST = os.getenv("FLASK_HOST", "127.0.0.1")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    # Ollama & Gemma 3:1b
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")
    OLLAMA_TIMEOUT_SECONDS = int(os.getenv("OLLAMA_TIMEOUT_SECONDS", 60))

    # ChromaDB & Embeddings
    CHROMADB_DIR = os.getenv("CHROMADB_DIR", str(BACKEND_DIR / "chroma_db"))
    EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    TOP_K_RESULTS = int(os.getenv("TOP_K_RESULTS", 5))

    # Data paths
    DESTINATIONS_DATA_PATH = str(
        Path(__file__).resolve().parent / "data" / "destinations.json"
    )
