import os
import sys
from app import create_app
from app.config import Config

app = create_app(Config)

if __name__ == "__main__":
    print(f"==================================================")
    print(f"  Ghumakad AI Backend Server Starting")
    print(f"  Host: {Config.FLASK_HOST} | Port: {Config.FLASK_PORT}")
    print(f"  Ollama Target: {Config.OLLAMA_BASE_URL} ({Config.OLLAMA_MODEL})")
    print(f"  Vector Store Dir: {Config.CHROMADB_DIR}")
    print(f"==================================================")
    app.run(
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG,
    )
