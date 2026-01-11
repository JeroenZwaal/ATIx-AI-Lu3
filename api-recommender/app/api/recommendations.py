from fastapi import APIRouter, HTTPException

from app.models.schemas import RecommendRequest, RecommendResponse
from app.services.recommendation import recommendation_service

router = APIRouter()

@router.post("/recommend", response_model=RecommendResponse)
async def get_recommendations(request: RecommendRequest):
    """
    Get module recommendations based on student profile.
    """
    try:
        if not recommendation_service.is_ready():
            raise HTTPException(status_code=500, detail="Recommendation service not initialized")
        
        # Get recommendations using individual fields directly
        result = recommendation_service.get_recommendations(
            study_program=request.study_program,
            interests=request.interests,
            skills=request.skills,
            favorites=request.favorites,
            top_n=request.k,
            location=request.study_location,
            study_credit=request.study_credit,
            level=request.level
        )
        
        return RecommendResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")