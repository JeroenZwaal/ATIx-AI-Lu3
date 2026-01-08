import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Inject,
    BadRequestException,
} from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UpdateUserDto } from 'src/interfaces/presenters/user.dto';
import { response } from 'express';

@Injectable()
export class UserService {
    constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository) {}
    async updateProfile(currentUser: User, profileData: UpdateUserDto): Promise<void> {
        if (!currentUser) {
            console.log(currentUser, 'this is current user');
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
            studyProgram: userProfile.studyProgram? userProfile.studyProgram : '',
            studyLocation: userProfile.studyLocation? userProfile.studyLocation : '',
            studyCredits: userProfile.studyCredits? userProfile.studyCredits : 0,
            yearOfStudy: userProfile.yearOfStudy? userProfile.yearOfStudy : 0,
            skills: userProfile.skills,
            interests: userProfile.interests,
        };
        return responseUser;
    }

}
