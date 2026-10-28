import os
import sys
import json
import logging
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import Config
from app.models.destination import Destination

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("build_vector_store")

COLLECTION_NAME = "ghumakad_destinations"


def get_embedding_function():
    """
    Returns the SentenceTransformer embedding function for ChromaDB.
    Uses all-MiniLM-L6-v2 by default.
    """
    try:
        from chromadb.utils import embedding_functions
        return embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=Config.EMBEDDING_MODEL_NAME
        )
    except Exception as e:
        logger.warning(
            f"SentenceTransformerEmbeddingFunction unavailable ({e}). Falling back to DefaultEmbeddingFunction."
        )
        from chromadb.utils import embedding_functions
        return embedding_functions.DefaultEmbeddingFunction()


def build_vector_store(force_rebuild: bool = True):
    """
    Loads destination JSON, validates each record, and upserts embeddings
    into persistent ChromaDB.
    """
    import chromadb

    data_file = Path(Config.DESTINATIONS_DATA_PATH)
    if not data_file.exists():
        raise FileNotFoundError(f"Destinations file not found at {data_file}")

    with open(data_file, "r", encoding="utf-8") as f:
        raw_items = json.load(f)

    valid_destinations = []
    for item in raw_items:
        try:
            dest = Destination(**item)
            valid_destinations.append(dest)
        except Exception as e:
            logger.warning(f"Skipping record due to validation failure: {e}")

    logger.info(f"Loaded {len(valid_destinations)} validated destination records.")

    # Ensure persistence directory exists
    persist_dir = Path(Config.CHROMADB_DIR)
    persist_dir.mkdir(parents=True, exist_ok=True)

    client = chromadb.PersistentClient(path=str(persist_dir))
    embedding_fn = get_embedding_function()

    if force_rebuild:
        try:
            client.delete_collection(name=COLLECTION_NAME)
            logger.info(f"Deleted existing collection '{COLLECTION_NAME}' for clean rebuild.")
        except Exception:
            pass

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )

    documents = []
    metadatas = []
    ids = []

    for d in valid_destinations:
        # Rich semantic document representation for RAG retrieval
        doc_text = (
            f"Destination: {d.name}\n"
            f"State: {d.state}\n"
            f"Vibe & Categories: {', '.join(d.destination_types)}\n"
            f"Overview: {d.description}\n"
            f"Top Attractions: {', '.join(d.attractions)}\n"
            f"Travel Tips: {', '.join(d.travel_tips)}\n"
            f"Recommended Season: {d.best_season}\n"
        )
        documents.append(doc_text)
        metadatas.append({
            "destination_id": d.destination_id,
            "name": d.name,
            "state": d.state,
            "destination_types": ",".join(d.destination_types),
            "best_season": d.best_season,
            "confidence": d.estimated_cost_confidence,
        })
        ids.append(d.destination_id)

    # Upsert to prevent duplicate records
    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
    )

    count = collection.count()
    logger.info(
        f"Successfully indexed {count} destination documents in ChromaDB collection '{COLLECTION_NAME}'."
    )
    return count


if __name__ == "__main__":
    print("=" * 60)
    print("  Ghumakad AI: Building ChromaDB Vector Store")
    print(f"  Persistence Directory: {Config.CHROMADB_DIR}")
    print(f"  Embedding Model: {Config.EMBEDDING_MODEL_NAME}")
    print("=" * 60)
    count = build_vector_store(force_rebuild=True)
    print(f"[SUCCESS] Vector store built with {count} destinations.")
