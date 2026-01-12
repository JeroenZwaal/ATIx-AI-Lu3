import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
    @Query('level') level?: string
  ): Promise<RecommendationsResponseDto> {
    // Convert user favorites to string array
    const favorites = user.favorites?.map(fav => fav.moduleName) || [];

    // Build request from user profile with optional query overrides
    const request = {
      study_year: user.yearOfStudy || 2,
      study_program: user.studyProgram || 'Informatica',
      study_location: study_location || user.studyLocation,
      study_credit: study_credit ? Number(study_credit) : user.studyCredits,
      level: level,
      skills: user.skills || [],
      interests: user.interests || [],
      favorites: favorites,
      k: k ? Number(k) : 5,
    };

    return this.recommendationService.getRecommendations(request);
  }
}