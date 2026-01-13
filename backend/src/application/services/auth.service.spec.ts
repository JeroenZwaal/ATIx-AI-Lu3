/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: any;

    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        firstName: 'Test',
        lastName: 'User',
        skills: [],
        interests: [],
        favorites: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserRepository = {
        findByEmail: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get('IUserRepository');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return access token when credentials are valid', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const loginDto = {
                email: 'test@example.com',
                passwordHash: 'password123',
            };

            const result = await service.login(loginDto);

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe(mockUser.email);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.passwordHash);
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);

            const loginDto = {
                email: 'nonexistent@example.com',
                passwordHash: 'password123',
            };

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
        });

        it('should throw UnauthorizedException when password is incorrect', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const loginDto = {
                email: 'test@example.com',
                passwordHash: 'wrongpassword',
            };

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.passwordHash);
        });
    });

    describe('register', () => {
        it('should create new user and return access token', async () => {
            const hashedPassword = 'hashedPassword123';

            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockUser);

            const registerDto = {
                email: 'newuser@example.com',
                passwordHash: 'password123',
                firstName: 'New',
                lastName: 'User',
            };

            const result = await service.register(registerDto);

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('user');
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('newuser@example.com');
            expect(mockUserRepository.create).toHaveBeenCalled();
        });

        it('should throw ConflictException when user already exists', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            const registerDto = {
                email: 'test@example.com',
                passwordHash: 'password123',
                firstName: 'Test',
                lastName: 'User',
            };

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
        });
    });
});
