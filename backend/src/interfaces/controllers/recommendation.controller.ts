import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { RecommendationService } from '../../application/services/recommendation.service';
import { RecommendationsResponseDto } from '../presenters/recommendation.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.auth.guard';
import { CURRENTUSER } from '../decorators/current.user.decorator';
import { User } from '../../domain/entities/user.entity';

@Controller('api/recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
    constructor(private readonly recommendationService: RecommendationService) {}

    @Get()
    async getRecommendations(
        @CURRENTUSER() user: User,
        @Query('k') k?: number,
        @Query('study_location') study_location?: string,
        @Query('study_credit') study_credit?: number,
        @Query('level') level?: string,
    ): Promise<RecommendationsResponseDto> {
        // Valideer en sanitize query parameters om XSS te voorkomen
        let sanitizedStudyLocation: string | undefined;
        if (study_location !== undefined) {
            if (typeof study_location !== 'string') {
                throw new BadRequestException('study_location must be a string');
            }
            sanitizedStudyLocation = study_location.trim();
            if (sanitizedStudyLocation.length > 100) {
                throw new BadRequestException('study_location too long (max 100 characters)');
            }
        }

        let sanitizedLevel: string | undefined;
        if (level !== undefined) {
            if (typeof level !== 'string') {
                throw new BadRequestException('level must be a string');
            }
            sanitizedLevel = level.trim();
            if (sanitizedLevel.length > 50) {
                throw new BadRequestException('level too long (max 50 characters)');
            }
        }

        // Valideer numerieke parameters
        let sanitizedK: number | undefined;
        if (k !== undefined) {
            const kNum = Number(k);
            if (!Number.isFinite(kNum) || kNum < 1 || kNum > 100) {
                throw new BadRequestException('k must be a number between 1 and 100');
            }
            sanitizedK = Math.floor(kNum);
        }

        let sanitizedStudyCredit: number | undefined;
        if (study_credit !== undefined) {
            const creditNum = Number(study_credit);
            if (!Number.isFinite(creditNum) || creditNum < 0 || creditNum > 1000) {
                throw new BadRequestException('study_credit must be a number between 0 and 1000');
            }
            sanitizedStudyCredit = Math.floor(creditNum);
        }

        // Convert user favorites to string array
        const favorites = (user.favorites ?? []).map((fav) => fav.moduleName).filter(Boolean);

        const hasProfileData =
            (user.studyProgram?.trim()?.length ?? 0) > 0 ||
            (typeof user.yearOfStudy === 'number' && user.yearOfStudy > 0) ||
            (user.studyLocation?.trim()?.length ?? 0) > 0 ||
            (typeof user.studyCredits === 'number' && user.studyCredits > 0) ||
            (user.skills?.length ?? 0) > 0 ||
            (user.interests?.length ?? 0) > 0 ||
            favorites.length > 0;

        // If the user has not filled in any profile fields, don't generate generic recommendations.
        // The frontend will show a CTA to complete the profile.
        if (!hasProfileData) {
            return {
                recommendations: [],
                total_found: 0,
            };
        }

        // Build request from user profile with optional query overrides
        const request = {
            study_year: user.yearOfStudy || 2,
            study_program: user.studyProgram || 'Informatica',
            study_location: sanitizedStudyLocation || user.studyLocation,
            study_credit:
                sanitizedStudyCredit !== undefined ? sanitizedStudyCredit : user.studyCredits,
            level: sanitizedLevel,
            skills: user.skills || [],
            interests: user.interests || [],
            favorites: favorites,
            k: sanitizedK !== undefined ? sanitizedK : 5,
        };

        return this.recommendationService.getRecommendations(request);
    }
}
