export interface RecommendationItem {
    /** External module id coming from the recommender */
    id: number;
    name: string;
    shortdescription: string;
    similarity: number;
    location: string;
    study_credit: number;
    /** Backward compatibility with older API responses */
    studycredit?: number;
    level: string;
    module_tags: string;
    match_terms: string[];
    reason: string;
    /** English reason provided by the recommender */
    reason_en?: string;
}

export interface RecommendationsResponse {
    recommendations: RecommendationItem[];
    total_found: number;
}
