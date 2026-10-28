# Contributing to Ghumakad AI

Thank you for your interest in contributing to Ghumakad AI ("Your Budget. Your Vibe. Your Next Adventure.")!

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Development Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Set up the development environments:
   - **Backend**:
     ```bash
     cd backend
     python -m venv venv
     # Windows:
     .\venv\Scripts\activate
     # Linux/macOS:
     source venv/bin/activate
     pip install -r requirements.txt
     python scripts/build_vector_store.py
     python run.py
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```

3. Ensure tests pass:
   ```bash
   cd backend
   pytest tests/ -v
   ```

4. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(budget): add seasonal pricing adjustment factor"
   ```

5. Push to your branch and open a Pull Request with a clear summary of your changes.

## Guidelines
- Follow the MVC-inspired architecture in `backend/app/`.
- Frontend code must be written in **JavaScript (React/JSX)**. Do not introduce TypeScript.
- All budget calculations must reside in Python services (`backend/app/services/budget_service.py`), never inside LLM prompts.
- Ensure new endpoints have corresponding Pytest tests in `backend/tests/`.
