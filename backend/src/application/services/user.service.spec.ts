/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ModuleService } from './module.service';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User, UserFavorite } from '../../domain/entities/user.entity';
import { Module } from '../../domain/entities/module.entity';
import { UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
    let service: UserService;
    let userRepository: IUserRepository;
    let moduleService: ModuleService;

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

    const mockUserRepository: jest.Mocked<IUserRepository> = {
        findById: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        addFavorite: jest.fn(),
        removeFavorite: jest.fn(),
        updateRefreshToken: jest.fn(),
        enable2FA: jest.fn(),
        disable2FA: jest.fn(),
        getFavorites: jest.fn(),
    };

    const mockModuleService: jest.Mocked<Partial<ModuleService>> = {
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
                {
                    provide: ModuleService,
                    useValue: mockModuleService,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get('IUserRepository');
        moduleService = module.get(ModuleService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('updateProfile', () => {
        it('should update profile with valid data', async () => {
            const profileData = {
                studyProgram: 'Computer Science',
                studyLocation: 'Utrecht',
                studyCredits: 60,
                yearOfStudy: 3,
                skills: ['Java', 'Python'],
                interests: ['AI', 'Data Science'],
            };

            await service.updateProfile(mockUser, profileData);

            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser._id, profileData);
        });

        it('should throw UnauthorizedException when user is null', async () => {
            const profileData = { studyProgram: 'Test' };

            await expect(
                service.updateProfile(null as unknown as User, profileData),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw BadRequestException when studyProgram is not a string', async () => {
            const profileData = { studyProgram: 123 as unknown as string };

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException when studyProgram is empty', async () => {
            const profileData = { studyProgram: '   ' };

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                'studyProgram cannot be empty',
            );
        });

        it('should throw BadRequestException when studyProgram is too long', async () => {
            const profileData = { studyProgram: 'a'.repeat(101) };

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                'studyProgram is too long',
            );
        });

        it('should validate studyLocation correctly', async () => {
            const profileData = { studyLocation: 'Rotterdam' };

            await service.updateProfile(mockUser, profileData);

            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser._id, profileData);
        });

        it('should throw BadRequestException when studyLocation is empty', async () => {
            const profileData = { studyLocation: '' };

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                'studyLocation cannot be empty',
            );
        });

        it('should validate studyCredits correctly', async () => {
            const profileData = { studyCredits: 45 };

            await service.updateProfile(mockUser, profileData);

            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser._id, profileData);
        });

        it('should throw BadRequestException when studyCredits is not a number', async () => {
            const profileData = { studyCredits: 'abc' as unknown as number };

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                'studyCredits must be a number',
            );
        });

        it('should throw BadRequestException when studyCredits is out of range', async () => {
            const profileData = { studyCredits: 1001 };

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                'studyCredits out of range',
            );
        });

        it('should validate yearOfStudy correctly', async () => {
            const profileData = { yearOfStudy: 4 };

            await service.updateProfile(mockUser, profileData);

            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser._id, profileData);
        });

        it('should throw BadRequestException when yearOfStudy is not an integer', async () => {
            const profileData = { yearOfStudy: 2.5 };

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                'yearOfStudy must be an integer',
            );
        });

        it('should throw BadRequestException when yearOfStudy is out of range', async () => {
            const profileData = { yearOfStudy: 11 };

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                'yearOfStudy out of range',
            );
        });

        it('should validate skills array correctly', async () => {
            const profileData = { skills: ['Python', 'JavaScript', 'Docker'] };

            await service.updateProfile(mockUser, profileData);

            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser._id, profileData);
        });

        it('should throw BadRequestException when skills is not an array', async () => {
            const profileData = { skills: 'not-an-array' as unknown as string[] };

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                'skills must be an array',
            );
        });

        it('should throw BadRequestException when skills has too many items', async () => {
            const profileData = { skills: Array(51).fill('skill') };

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                'skills has too many items',
            );
        });

        it('should filter out empty strings from skills', async () => {
            const profileData = { skills: ['Python', '', 'JavaScript', '   '] };

            await service.updateProfile(mockUser, profileData);

            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser._id, {
                skills: ['Python', 'JavaScript'],
            });
        });

        it('should remove duplicate skills', async () => {
            const profileData = { skills: ['Python', 'JavaScript', 'Python'] };

            await service.updateProfile(mockUser, profileData);

            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser._id, {
                skills: ['Python', 'JavaScript'],
            });
        });

        it('should validate interests array correctly', async () => {
            const profileData = { interests: ['AI', 'Web Development'] };

            await service.updateProfile(mockUser, profileData);

            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser._id, profileData);
        });

        it('should throw BadRequestException when no valid fields provided', async () => {
            const profileData = {};

            await expect(service.updateProfile(mockUser, profileData)).rejects.toThrow(
                'No valid profile fields provided',
            );
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser);

            const result = await service.getProfile(mockUser);

            expect(result).toEqual({
                studyProgram: 'Software Engineering',
                studyLocation: 'Amsterdam',
                studyCredits: 30,
                yearOfStudy: 2,
                skills: ['programming', 'web development'],
                interests: ['AI', 'machine learning'],
            });
        });

        it('should throw UnauthorizedException when user not found', async () => {
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(service.getProfile(mockUser)).rejects.toThrow(UnauthorizedException);
        });

        it('should return empty values for missing profile fields', async () => {
            const userWithoutProfile = {
                ...mockUser,
                studyProgram: undefined,
                studyLocation: undefined,
                studyCredits: undefined,
                yearOfStudy: undefined,
            };
            mockUserRepository.findById.mockResolvedValue(userWithoutProfile);

            const result = await service.getProfile(mockUser);

            expect(result.studyProgram).toBe('');
            expect(result.studyLocation).toBe('');
            expect(result.studyCredits).toBe(0);
            expect(result.yearOfStudy).toBe(0);
        });
    });

    describe('getFavorites', () => {
        it('should return user favorites', async () => {
            const userWithFavorites = {
                ...mockUser,
                favorites: [
                    new UserFavorite('507f1f77bcf86cd799439012', new Date(), 'Test Module'),
                ],
            };
            mockUserRepository.findById.mockResolvedValue(userWithFavorites);
            (mockModuleService.findById as jest.Mock).mockResolvedValue(mockModule);

            const result = await service.getFavorites(mockUser, mockUser._id);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockModule);
        });

        it('should throw NotFoundException when user not found', async () => {
            const nonexistentUser = { ...mockUser, _id: 'nonexistent' };
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(service.getFavorites(nonexistentUser, 'nonexistent')).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should filter out null modules', async () => {
            const userWithFavorites = {
                ...mockUser,
                favorites: [
                    new UserFavorite('valid-id', new Date(), 'Valid Module'),
                    new UserFavorite('invalid-id', new Date(), 'Invalid Module'),
                ],
            };
            mockUserRepository.findById.mockResolvedValue(userWithFavorites);
            (mockModuleService.findById as jest.Mock)
                .mockResolvedValueOnce(mockModule)
                .mockResolvedValueOnce(null);

            const result = await service.getFavorites(mockUser, mockUser._id);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockModule);
        });
    });

    describe('addFavorite', () => {
        it('should add favorite successfully', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser);
            (mockModuleService.findById as jest.Mock).mockResolvedValue(mockModule);

            await service.addFavorite(mockUser, mockUser._id, mockModule.id);

            expect(mockUserRepository.addFavorite).toHaveBeenCalledWith(
                mockUser._id,
                expect.objectContaining({
                    moduleId: mockModule.id,
                    moduleName: mockModule.name,
                }),
            );
        });

        it('should throw NotFoundException when user not found', async () => {
            const nonexistentUser = { ...mockUser, _id: 'nonexistent' };
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(
                service.addFavorite(nonexistentUser, 'nonexistent', 'module-id'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when module not found', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser);
            (mockModuleService.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                service.addFavorite(mockUser, mockUser._id, 'nonexistent-module'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should not add duplicate favorites', async () => {
            const userWithFavorite = {
                ...mockUser,
                favorites: [new UserFavorite(mockModule.id, new Date(), 'Test Module')],
            };
            mockUserRepository.findById.mockResolvedValue(userWithFavorite);

            await service.addFavorite(mockUser, mockUser._id, mockModule.id);

            expect(mockUserRepository.addFavorite).not.toHaveBeenCalled();
        });
    });

    describe('removeFavorite', () => {
        it('should remove favorite successfully', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser);

            await service.removeFavorite(mockUser, mockUser._id, mockModule.id);

            expect(mockUserRepository.removeFavorite).toHaveBeenCalledWith(
                mockUser._id,
                mockModule.id,
            );
        });

        it('should throw NotFoundException when user not found', async () => {
            const nonexistentUser = { ...mockUser, _id: 'nonexistent' };
            mockUserRepository.findById.mockResolvedValue(null);

            await expect(
                service.removeFavorite(nonexistentUser, 'nonexistent', 'module-id'),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
