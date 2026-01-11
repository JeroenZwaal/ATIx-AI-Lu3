from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api import health, recommendations
from app.services.recommendation import recommendation_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title=settings.API_TITLE,
        description=settings.API_DESCRIPTION,
        version=settings.API_VERSION,
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production: specify allowed origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(health.router, tags=["health"])
    app.include_router(recommendations.router, prefix="/api", tags=["recommendations"])

    # Startup event
    @app.on_event("startup")
    async def startup_event():
        """Initialize services on startup."""
        try:
            logger.info("Starting recommendation service initialization...")
            recommendation_service.load_dataset(settings.CSV_PATH)
            logger.info(f"Dataset loaded: {recommendation_service.get_stats()['modules_count']} modules")
            logger.info(f"Features initialized: {recommendation_service.get_stats()['features_count']} features")
            logger.info("Recommendation API ready!")
        except Exception as e:
            logger.error(f"Failed to initialize recommendation service: {e}")
            raise e

    return app

# Create app instance
app = create_app()