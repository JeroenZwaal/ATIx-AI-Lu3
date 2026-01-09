"""
Main entry point for the Module Recommendation API.
This file serves as the entry point for uvicorn.
"""

from app.main import app

# This allows both:
# uvicorn main:app --reload (from api-recommender directory)
# uvicorn app.main:app --reload (also from api-recommender directory)