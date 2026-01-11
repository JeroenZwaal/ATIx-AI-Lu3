from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.recommendation import recommendation_service

router = APIRouter()

@router.get("/", tags=["health"])
async def root():
    """Root endpoint - basic API info."""
    return {
        "message": "Module Recommendation API",
        "description": "API voor het voorspellen van keuzemodule aanbevelingen",
        "status": "running",
        "endpoints": {
            "predictions": "/api/recommend",
            "health": "/health",
            "docs": "/docs"
        }
    }

@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Detailed health check with service status."""
    stats = recommendation_service.get_stats()
    
    return HealthResponse(
        status="healthy" if recommendation_service.is_ready() else "not ready",
        dataset_loaded=recommendation_service.df is not None,
        modules_count=stats["modules_count"],
        features_count=stats["features_count"]
    )