import { Injectable, Inject } from '@nestjs/common';
import type { IRecommendationRepository } from '../../domain/repositories/recommendation.repository.interface';
import { RecommendRequest, RecommendResponse } from '../../domain/entities/recommendation.entity';

@Injectable()
export class RecommendationService {
    constructor(
        @Inject('IRecommendationRepository')
        private readonly recommendationRepository: IRecommendationRepository,
    ) {}

    async getRecommendations(request: RecommendRequest): Promise<RecommendResponse> {
        return await this.recommendationRepository.getRecommendations(request);
    }
}
