export class RecommendationItemDto {
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

export class RecommendationsResponseDto {
    recommendations: RecommendationItemDto[];
    total_found: number;
}
