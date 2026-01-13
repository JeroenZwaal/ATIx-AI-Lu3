import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IRecommendationRepository } from '../../domain/repositories/recommendation.repository.interface';
import { RecommendRequest, RecommendResponse } from '../../domain/entities/recommendation.entity';

@Injectable()
export class RecommendationRepository implements IRecommendationRepository {
    private readonly logger = new Logger(RecommendationRepository.name);
    private readonly fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000/api';

    async getRecommendations(request: RecommendRequest): Promise<RecommendResponse> {
        try {
            const response = await fetch(`${this.fastApiUrl}/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) {
                this.logger.error(`FastAPI responded with status ${response.status}`);
                throw new HttpException('Failed to fetch recommendations', HttpStatus.BAD_GATEWAY);
            }
            const data = (await response.json()) as unknown;
            return data as RecommendResponse;
        } catch (error) {
            this.logger.error('Error fetching recommendations from FastAPI', error);
            throw new HttpException(
                'Error fetching recommendations',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
