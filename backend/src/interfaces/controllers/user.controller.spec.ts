/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../application/services/user.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.auth.guard';
import { User, UserFavorite } from '../../domain/entities/user.entity';
import { Module } from '../../domain/entities/module.entity';
import { UpdateUserDto } from '../presenters/user.dto';
import { HttpException } from '@nestjs/common';

describe('UserController', () => {
    let controller: UserController;
    let userService: UserService;

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
        skills: ['programming'],
        interests: ['AI'],
        favorites: [],
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockModule: Module = {
        id: '507f1f77bcf86cd799439012',
        externalId: 123,
        name: 'Test Module',
        shortdescription: 'Short description',
        description: 'Full description',
        content: 'Module content',
        studycredit: 5,
        location: 'Amsterdam',
        contactId: 1,
        level: 'NLQF5',
        learningoutcomes: 'Learning outcomes',
        tags: ['programming'],
        combinedText: 'Combined text',
    };

    const mockUserService = {
        updateProfile: jest.fn(),
        getProfile: jest.fn(),
        getFavorites: jest.fn(),
        addFavorite: jest.fn(),
        removeFavorite: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('updateProfile', () => {
        it('should update user profile successfully', async () => {
            const profileData: UpdateUserDto = {
                studyProgram: 'Computer Science',
                studyLocation: 'Utrecht',
                studyCredits: 60,
                yearOfStudy: 3,
                skills: ['Python', 'Java'],
                interests: ['Data Science'],
            };
            mockUserService.updateProfile.mockResolvedValue(undefined);

            const result = await controller.updateProfile(mockUser, profileData);

            expect(result).toEqual({ message: 'Profile updated successfully' });
            expect(userService.updateProfile).toHaveBeenCalledWith(mockUser, profileData);
        });

        it('should throw HttpException when update fails', async () => {
            const profileData: UpdateUserDto = {
                studyProgram: 'Invalid',
                studyLocation: '',
                studyCredits: 0,
                yearOfStudy: 0,
                skills: [],
                interests: [],
            };
            mockUserService.updateProfile.mockRejectedValue(new Error('Update failed'));

            await expect(controller.updateProfile(mockUser, profileData)).rejects.toThrow(
                HttpException,
            );
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            const profileData: UpdateUserDto = {
                studyProgram: 'Software Engineering',
                studyLocation: 'Amsterdam',
                studyCredits: 30,
                yearOfStudy: 2,
                skills: ['programming'],
                interests: ['AI'],
            };
            mockUserService.getProfile.mockResolvedValue(profileData);

            const result = await controller.getProfile(mockUser);

            expect(result).toEqual(profileData);
            expect(userService.getProfile).toHaveBeenCalledWith(mockUser);
        });

        it('should throw HttpException when get profile fails', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockUserService.getProfile.mockRejectedValue(new Error('Get profile failed'));

            await expect(controller.getProfile(mockUser)).rejects.toThrow(HttpException);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('getFavorites', () => {
        it('should return user favorites', async () => {
            const modules = [mockModule];
            mockUserService.getFavorites.mockResolvedValue(modules);

            const result = await controller.getFavorites(mockUser);

            expect(result).toEqual(modules);
            expect(userService.getFavorites).toHaveBeenCalledWith(mockUser, mockUser._id);
        });

        it('should return empty array when no favorites', async () => {
            mockUserService.getFavorites.mockResolvedValue([]);

            const result = await controller.getFavorites(mockUser);

            expect(result).toEqual([]);
        });
    });

    describe('addFavorite', () => {
        it('should add favorite successfully', async () => {
            mockUserService.addFavorite.mockResolvedValue(undefined);

            const result = await controller.addFavorite(mockUser, mockModule.id);

            expect(result).toEqual({ message: 'Favorite added successfully' });
            expect(userService.addFavorite).toHaveBeenCalledWith(
                mockUser,
                mockUser._id,
                mockModule.id,
            );
        });

        it('should handle errors when adding favorite', async () => {
            mockUserService.addFavorite.mockRejectedValue(new Error('Module not found'));

            await expect(
                controller.addFavorite(mockUser, '507f1f77bcf86cd799439012'),
            ).rejects.toThrow('Module not found');
        });
    });

    describe('removeFavorite', () => {
        it('should remove favorite successfully', async () => {
            mockUserService.removeFavorite.mockResolvedValue(undefined);

            const result = await controller.removeFavorite(mockUser, mockModule.id);

            expect(result).toEqual({ message: 'Favorite removed successfully' });
            expect(userService.removeFavorite).toHaveBeenCalledWith(
                mockUser,
                mockUser._id,
                mockModule.id,
            );
        });

        it('should handle errors when removing favorite', async () => {
            mockUserService.removeFavorite.mockRejectedValue(new Error('User not found'));

            await expect(
                controller.removeFavorite(mockUser, '507f1f77bcf86cd799439012'),
            ).rejects.toThrow('User not found');
        });
    });
});
