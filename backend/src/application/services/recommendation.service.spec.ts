/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { IRecommendationRepository } from '../../domain/repositories/recommendation.repository.interface';
import { RecommendRequest, RecommendResponse } from '../../domain/entities/recommendation.entity';

describe('RecommendationService', () => {
    let service: RecommendationService;
    let recommendationRepository: IRecommendationRepository;

    const mockRequest: RecommendRequest = {
        study_year: 2,
        study_program: 'Software Engineering',
        study_location: 'Amsterdam',
        study_credit: 5,
        level: 'NLQF5',
        skills: ['programming', 'web development'],
        interests: ['AI', 'machine learning'],
        favorites: ['module1', 'module2'],
        k: 5,
    };

    const mockResponse: RecommendResponse = {
        recommendations: [
            {
                id: 123,
                name: 'AI Fundamentals',
                shortdescription: 'Introduction to AI',
                similarity: 0.85,
                location: 'Amsterdam',
                study_credit: 5,
                level: 'NLQF5',
                module_tags: 'AI, programming',
                match_terms: ['AI', 'programming'],
                reason: 'Past op je interesse in AI',
                reason_en: 'Matches your interest in AI',
            },
            {
                id: 456,
                name: 'Machine Learning',
                shortdescription: 'ML basics',
                similarity: 0.78,
                location: 'Amsterdam',
                study_credit: 5,
                level: 'NLQF5',
                module_tags: 'ML, data science',
                match_terms: ['machine learning', 'data'],
                reason: 'Sluit aan bij je skills',
                reason_en: 'Aligns with your skills',
            },
        ],
        total_found: 2,
    };

    const mockRecommendationRepository: jest.Mocked<IRecommendationRepository> = {
        getRecommendations: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecommendationService,
                {
                    provide: 'IRecommendationRepository',
                    useValue: mockRecommendationRepository,
                },
            ],
        }).compile();

        service = module.get<RecommendationService>(RecommendationService);
        recommendationRepository = module.get('IRecommendationRepository');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getRecommendations', () => {
        it('should return recommendations based on user profile', async () => {
            mockRecommendationRepository.getRecommendations.mockResolvedValue(mockResponse);

            const result = await service.getRecommendations(mockRequest);

            expect(result).toEqual(mockResponse);
            expect(result.recommendations).toHaveLength(2);
            expect(result.total_found).toBe(2);
            expect(mockRecommendationRepository.getRecommendations).toHaveBeenCalledWith(
                mockRequest,
            );
        });

        it('should return empty recommendations when no matches found', async () => {
            const emptyResponse: RecommendResponse = {
                recommendations: [],
                total_found: 0,
            };
            mockRecommendationRepository.getRecommendations.mockResolvedValue(emptyResponse);

            const result = await service.getRecommendations(mockRequest);

            expect(result.recommendations).toEqual([]);
            expect(result.total_found).toBe(0);
        });

        it('should handle request with minimal fields', async () => {
            const minimalRequest: RecommendRequest = {
                study_year: 1,
                study_program: 'Computer Science',
                skills: [],
                interests: [],
            };
            mockRecommendationRepository.getRecommendations.mockResolvedValue(mockResponse);

            const result = await service.getRecommendations(minimalRequest);

            expect(result).toEqual(mockResponse);
            expect(mockRecommendationRepository.getRecommendations).toHaveBeenCalledWith(
                minimalRequest,
            );
        });

        it('should handle request with custom k value', async () => {
            const requestWithK = { ...mockRequest, k: 10 };
            mockRecommendationRepository.getRecommendations.mockResolvedValue(mockResponse);

            const result = await service.getRecommendations(requestWithK);

            expect(result).toEqual(mockResponse);
            expect(mockRecommendationRepository.getRecommendations).toHaveBeenCalledWith(
                requestWithK,
            );
        });

        it('should handle request with favorites', async () => {
            const requestWithFavorites = {
                ...mockRequest,
                favorites: ['fav1', 'fav2', 'fav3'],
            };
            mockRecommendationRepository.getRecommendations.mockResolvedValue(mockResponse);

            const result = await service.getRecommendations(requestWithFavorites);

            expect(result).toEqual(mockResponse);
            expect(mockRecommendationRepository.getRecommendations).toHaveBeenCalledWith(
                requestWithFavorites,
            );
        });

        it('should include similarity scores in recommendations', async () => {
            mockRecommendationRepository.getRecommendations.mockResolvedValue(mockResponse);

            const result = await service.getRecommendations(mockRequest);

            expect(result.recommendations[0].similarity).toBe(0.85);
            expect(result.recommendations[1].similarity).toBe(0.78);
        });

        it('should include explainability information', async () => {
            mockRecommendationRepository.getRecommendations.mockResolvedValue(mockResponse);

            const result = await service.getRecommendations(mockRequest);

            expect(result.recommendations[0].match_terms).toEqual(['AI', 'programming']);
            expect(result.recommendations[0].reason).toBeDefined();
        });
    });
});
