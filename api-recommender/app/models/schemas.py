from pydantic import BaseModel, Field
from typing import List, Optional

class RecommendRequest(BaseModel):
    study_program: Optional[str] = Field(None, description="Studie programma van de student")
    interests: Optional[List[str]] = Field(None, description="Lijst van interesses")
    skills: Optional[List[str]] = Field(None, description="Lijst van vaardigheden") 
    favorites: Optional[List[str]] = Field(None, description="Favoriete onderwerpen")
    study_location: Optional[str] = Field(None, description="Gewenste studielocatie")
    study_credit: Optional[int] = Field(None, description="Gewenste studiepunten")
    level: Optional[str] = Field(None, description="Gewenst niveau (bijv. NLQF5)")
    k: int = Field(5, description="Aantal aanbevelingen", ge=1, le=20)

class RecommendItem(BaseModel):
    id: int
    name: str
    shortdescription: str
    similarity: float = Field(..., description="Ruwe cosine similarity score")
    location: str
    study_credit: int
    level: str
    module_tags: str
    match_terms: List[str] = Field(..., description="Matching termen tussen profiel en module")
    reason: str = Field(..., description="Nederlandse uitleg waarom module past")
    reason_en: str = Field(..., description="English explanation why module fits")

class RecommendResponse(BaseModel):
    recommendations: List[RecommendItem]
    total_found: int = Field(..., description="Aantal gevonden aanbevelingen")

class HealthResponse(BaseModel):
    status: str
    dataset_loaded: bool
    modules_count: int
    features_count: int