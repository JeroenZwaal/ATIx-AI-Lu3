/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { ITokenBlacklistRepository } from '../../domain/repositories/token-blacklist.repository.interface';

// Mock bcrypt
jest.mock('bcryptjs');

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: IUserRepository;
    let tokenBlacklistRepository: ITokenBlacklistRepository;

    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        firstName: 'Test',
        lastName: 'User',
        skills: [],
        interests: [],
        favorites: [],
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserRepository: jest.Mocked<IUserRepository> = {
        findByEmail: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        addFavorite: jest.fn(),
        removeFavorite: jest.fn(),
        updateRefreshToken: jest.fn(),
        enable2FA: jest.fn(),
        disable2FA: jest.fn(),
        getFavorites: jest.fn(),
    };

    const mockTokenBlacklistRepository: jest.Mocked<ITokenBlacklistRepository> = {
        addToken: jest.fn(),
        isTokenBlacklisted: jest.fn(),
        removeExpiredTokens: jest.fn(),
    };

    beforeEach(async () => {
        process.env.JWT_SECRET = 'test-secret-key';

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
                {
                    provide: 'ITokenBlacklistRepository',
                    useValue: mockTokenBlacklistRepository,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get('IUserRepository');
        tokenBlacklistRepository = module.get('ITokenBlacklistRepository');
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

    describe('invalidateToken', () => {
        it('should add token to blacklist when token is valid', async () => {
            const token = jwt.sign(
                { email: 'test@example.com', sub: mockUser._id },
                'test-secret-key',
                { expiresIn: '24h' },
            );

            mockTokenBlacklistRepository.addToken.mockResolvedValue(undefined);

            await service.invalidateToken(token);

            expect(mockTokenBlacklistRepository.addToken).toHaveBeenCalled();
            const callArgs = mockTokenBlacklistRepository.addToken.mock.calls[0] as [string, Date];
            expect(callArgs[0]).toBe(token);
            expect(callArgs[1]).toBeInstanceOf(Date);
        });

        it('should not throw error when token is invalid', async () => {
            const invalidToken = 'invalid.token.here';

            mockTokenBlacklistRepository.addToken.mockResolvedValue(undefined);

            await expect(service.invalidateToken(invalidToken)).resolves.not.toThrow();
        });
    });

    describe('isTokenBlacklisted', () => {
        it('should return true when token is blacklisted', async () => {
            const token = 'some-token';
            mockTokenBlacklistRepository.isTokenBlacklisted.mockResolvedValue(true);

            const result = await service.isTokenBlacklisted(token);

            expect(result).toBe(true);
            expect(mockTokenBlacklistRepository.isTokenBlacklisted).toHaveBeenCalledWith(token);
        });

        it('should return false when token is not blacklisted', async () => {
            const token = 'some-token';
            mockTokenBlacklistRepository.isTokenBlacklisted.mockResolvedValue(false);

            const result = await service.isTokenBlacklisted(token);

            expect(result).toBe(false);
            expect(mockTokenBlacklistRepository.isTokenBlacklisted).toHaveBeenCalledWith(token);
        });
    });
});
