import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Inject,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UpdateUserDto } from '../../interfaces/presenters/user.dto';
import { response } from 'express';
import { ModuleService } from './module.service';
import { Module } from '../../domain/entities/module.entity';
import { UserFavorite } from '../../domain/entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
        private readonly moduleService: ModuleService,
    ) {}
    async updateProfile(currentUser: User, profileData: UpdateUserDto): Promise<void> {
        if (!currentUser) {
            throw new UnauthorizedException('User not found');
        }

        // Validate and sanitize incoming profile data
        const sanitized: Partial<UpdateUserDto> = {};

        // Study Program
        if (profileData.studyProgram !== undefined && profileData.studyProgram !== null) {
            if (typeof profileData.studyProgram !== 'string') {
                throw new BadRequestException('studyProgram must be a string');
            }
            const sp = profileData.studyProgram.trim();

            if (sp.length === 0) {
                throw new BadRequestException('studyProgram cannot be empty');
            }

            if (sp.length > 100) {
                throw new BadRequestException('studyProgram is too long (max 100 chars)');
            }
            sanitized.studyProgram = sp;
        }

        // Study Location
        if (profileData.studyLocation !== undefined && profileData.studyLocation !== null) {
            if (typeof profileData.studyLocation !== 'string') {
                throw new BadRequestException('studyLocation must be a string');
            }
            const sl = profileData.studyLocation.trim();

            if (sl.length === 0) {
                throw new BadRequestException('studyLocation cannot be empty');
            }

            if (sl.length > 100) {
                throw new BadRequestException('studyLocation is too long (max 100 chars)');
            }
            sanitized.studyLocation = sl;
        }

        // Study Credits (allow numeric input in string or number form)
        if (profileData.studyCredits !== undefined && profileData.studyCredits !== null) {
            const raw = String(profileData.studyCredits).trim();
            if (raw.length === 0) {
                throw new BadRequestException('studyCredits cannot be empty');
            }
            const creditsNum = Number(raw);
            if (!Number.isFinite(creditsNum) || Number.isNaN(creditsNum)) {
                throw new BadRequestException('studyCredits must be a number');
            }
            if (creditsNum < 0 || creditsNum > 1000) {
                throw new BadRequestException('studyCredits out of range');
            }
            sanitized.studyCredits = creditsNum;
        }

        // Year of Study needs to be an integer between 1 and 10
        if (profileData.yearOfStudy !== undefined && profileData.yearOfStudy !== null) {
            const raw = String(profileData.yearOfStudy).trim();
            if (raw.length === 0) {
                throw new BadRequestException('yearOfStudy cannot be empty');
            }
            const yearNum = Number(raw);
            if (!Number.isInteger(yearNum)) {
                throw new BadRequestException('yearOfStudy must be an integer');
            }
            if (yearNum < 1 || yearNum > 10) {
                throw new BadRequestException('yearOfStudy out of range');
            }
            sanitized.yearOfStudy = yearNum;
        }

        // Helper to validate tags
        const validateTags = (arr: unknown, fieldName: string): string[] => {
            if (!Array.isArray(arr)) {
                throw new BadRequestException(`${fieldName} must be an array`);
            }

            const MAX_TAGS = 50;
            const MAX_LENGTH = 100;
            const cleaned: string[] = [];

            for (const item of arr as unknown[]) {
                if (typeof item !== 'string') {
                    throw new BadRequestException(`${fieldName} items must be strings`);
                }

                const t = item.trim();
                if (!t) continue; // skip empty

                if (t.length > MAX_LENGTH) {
                    throw new BadRequestException(`${fieldName} item too long`);
                }

                if (!cleaned.includes(t)) {
                    cleaned.push(t);
                }

                if (cleaned.length > MAX_TAGS) {
                    throw new BadRequestException(`${fieldName} has too many items`);
                }
            }

            return cleaned;
        };

        if (profileData.skills !== undefined && profileData.skills !== null) {
            sanitized.skills = validateTags(profileData.skills, 'skills');
        }

        if (profileData.interests !== undefined && profileData.interests !== null) {
            sanitized.interests = validateTags(profileData.interests, 'interests');
        }

        // If no valid fields were provided, return early
        if (Object.keys(sanitized).length === 0) {
            throw new BadRequestException('No valid profile fields provided');
        }

        // Update repository with sanitized data
        await this.userRepository.update(currentUser._id, sanitized);
        return;
    }

    async getProfile(user: User): Promise<UpdateUserDto> {
        const userProfile = await this.userRepository.findById(user._id);
        if (!userProfile) {
            throw new UnauthorizedException('User not found');
        }
        const responseUser: UpdateUserDto = {
            studyProgram: userProfile.studyProgram ? userProfile.studyProgram : '',
            studyLocation: userProfile.studyLocation ? userProfile.studyLocation : '',
            studyCredits: userProfile.studyCredits ? userProfile.studyCredits : 0,
            yearOfStudy: userProfile.yearOfStudy ? userProfile.yearOfStudy : 0,
            skills: userProfile.skills,
            interests: userProfile.interests,
        };
        return responseUser;
    }

    async getFavorites(authenticatedUser: User, userId: string): Promise<Module[]> {
        // Verifieer dat userId overeenkomt met geauthenticeerde user
        if (authenticatedUser._id.toString() !== userId.toString()) {
            throw new UnauthorizedException("Not authorized to access this user's favorites");
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const modulePromises = user.favorites.map((favorite) =>
            this.moduleService.findById(favorite.moduleId),
        );
        const modules = await Promise.all(modulePromises);
        return modules.filter((module): module is Module => module !== null);
    }

    async addFavorite(authenticatedUser: User, userId: string, moduleId: string): Promise<void> {
        // Verifieer dat userId overeenkomt met geauthenticeerde user
        if (authenticatedUser._id.toString() !== userId.toString()) {
            throw new UnauthorizedException("Not authorized to modify this user's favorites");
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if favorite already exists
        const existingFavorite = user.favorites.find((fav) => fav.moduleId === moduleId);
        if (existingFavorite) {
            return; // Already a favorite, no need to add again
        }

        // Get module to get module name
        const module = await this.moduleService.findById(moduleId);
        if (!module) {
            throw new NotFoundException('Module not found');
        }

        const favorite = new UserFavorite(moduleId, new Date(), module.name);

        await this.userRepository.addFavorite(userId, favorite);
    }

    async removeFavorite(authenticatedUser: User, userId: string, moduleId: string): Promise<void> {
        // Verifieer dat userId overeenkomt met geauthenticeerde user
        if (authenticatedUser._id.toString() !== userId.toString()) {
            throw new UnauthorizedException("Not authorized to modify this user's favorites");
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.userRepository.removeFavorite(userId, moduleId);
    }
}
