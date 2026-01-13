export interface RecommendRequest {
    study_year: number;
    study_program: string;
    study_location?: string;
    study_credit?: number;
    level?: string;
    skills: string[];
    interests: string[];
    favorites?: string[];
    k?: number;
}

export interface RecommendItem {
    id: number;
    name: string;
    shortdescription: string;
    similarity: number;
    location: string;
    study_credit: number;
    level: string;
    module_tags: string;
    match_terms: string[];
    reason: string;
    reason_en?: string;
}

export interface RecommendResponse {
    recommendations: RecommendItem[];
    total_found: number;
}
