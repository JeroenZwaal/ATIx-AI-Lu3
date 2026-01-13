import { RecommendRequest, RecommendResponse } from '../entities/recommendation.entity';

export interface IRecommendationRepository {
    getRecommendations(request: RecommendRequest): Promise<RecommendResponse>;
}

export const RECOMMENDATION_REPOSITORY = Symbol('IRecommendationRepository');
