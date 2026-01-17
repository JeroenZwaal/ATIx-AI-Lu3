/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from '../../application/services/recommendation.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.auth.guard';
import { User, UserFavorite } from '../../domain/entities/user.entity';
import { RecommendationsResponseDto } from '../presenters/recommendation.dto';

describe('RecommendationController', () => {
    let controller: RecommendationController;
    let recommendationService: RecommendationService;

    const mockUser: User = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        studyProgram: 'Software Engineering',
        studyLocation: 'Amsterdam',
        studyCredits: 30,
        yearOfStudy: 2,
        skills: ['programming', 'web development'],
        interests: ['AI', 'machine learning'],
        favorites: [new UserFavorite('module1', new Date(), 'Module 1')],
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockResponse: RecommendationsResponseDto = {
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
            },
        ],
        total_found: 1,
    };

    const mockRecommendationService = {
        getRecommendations: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RecommendationController],
            providers: [
                {
                    provide: RecommendationService,
                    useValue: mockRecommendationService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<RecommendationController>(RecommendationController);
        recommendationService = module.get<RecommendationService>(RecommendationService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getRecommendations', () => {
        it('should return recommendations based on user profile', async () => {
            mockRecommendationService.getRecommendations.mockResolvedValue(mockResponse);

            const result = await controller.getRecommendations(mockUser);

            expect(result).toEqual(mockResponse);
            expect(recommendationService.getRecommendations).toHaveBeenCalledWith({
                study_year: 2,
                study_program: 'Software Engineering',
                study_location: 'Amsterdam',
                study_credit: 30,
                level: undefined,
                skills: ['programming', 'web development'],
                interests: ['AI', 'machine learning'],
                favorites: ['Module 1'],
                k: 5,
            });
        });

        it('should use query parameters to override defaults', async () => {
            mockRecommendationService.getRecommendations.mockResolvedValue(mockResponse);

            const result = await controller.getRecommendations(
                mockUser,
                10,
                'Utrecht',
                15,
                'NLQF6',
            );

            expect(result).toEqual(mockResponse);
            expect(recommendationService.getRecommendations).toHaveBeenCalledWith({
                study_year: 2,
                study_program: 'Software Engineering',
                study_location: 'Utrecht',
                study_credit: 15,
                level: 'NLQF6',
                skills: ['programming', 'web development'],
                interests: ['AI', 'machine learning'],
                favorites: ['Module 1'],
                k: 10,
            });
        });

        it('should return empty recommendations when user has no profile data', async () => {
            const emptyUser: User = {
                ...mockUser,
                studyProgram: undefined,
                studyLocation: undefined,
                studyCredits: undefined,
                yearOfStudy: 0,
                skills: [],
                interests: [],
                favorites: [],
            };

            const result = await controller.getRecommendations(emptyUser);

            expect(result).toEqual({
                recommendations: [],
                total_found: 0,
            });
            expect(recommendationService.getRecommendations).not.toHaveBeenCalled();
        });

        it('should use defaults when user profile fields are missing', async () => {
            const partialUser: User = {
                ...mockUser,
                studyProgram: undefined,
                yearOfStudy: undefined,
                studyLocation: undefined,
                studyCredits: undefined,
                skills: ['JavaScript'],
                interests: [],
                favorites: [],
            };
            mockRecommendationService.getRecommendations.mockResolvedValue(mockResponse);

            const result = await controller.getRecommendations(partialUser);

            expect(result).toEqual(mockResponse);
            expect(recommendationService.getRecommendations).toHaveBeenCalledWith({
                study_year: 2,
                study_program: 'Informatica',
                study_location: undefined,
                study_credit: undefined,
                level: undefined,
                skills: ['JavaScript'],
                interests: [],
                favorites: [],
                k: 5,
            });
        });

        it('should filter out null favorites', async () => {
            const userWithNullFavorites: User = {
                ...mockUser,
                favorites: [
                    new UserFavorite('module1', new Date(), 'Module 1'),
                    new UserFavorite('module2', new Date(), ''),
                    new UserFavorite('module3', new Date(), 'Module 3'),
                ],
            };
            mockRecommendationService.getRecommendations.mockResolvedValue(mockResponse);

            await controller.getRecommendations(userWithNullFavorites);

            expect(recommendationService.getRecommendations).toHaveBeenCalledWith(
                expect.objectContaining({
                    favorites: ['Module 1', 'Module 3'],
                }),
            );
        });

        it('should handle user with only favorites filled', async () => {
            const userOnlyFavorites: User = {
                ...mockUser,
                studyProgram: '',
                studyLocation: '',
                studyCredits: 0,
                yearOfStudy: 0,
                skills: [],
                interests: [],
                favorites: [new UserFavorite('module1', new Date(), 'Favorite Module')],
            };
            mockRecommendationService.getRecommendations.mockResolvedValue(mockResponse);

            const result = await controller.getRecommendations(userOnlyFavorites);

            expect(result).toEqual(mockResponse);
            expect(recommendationService.getRecommendations).toHaveBeenCalled();
        });
    });
});
