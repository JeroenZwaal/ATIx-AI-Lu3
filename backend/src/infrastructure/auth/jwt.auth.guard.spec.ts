/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.auth.guard';
import { AuthService } from '../../application/services/auth.service';
import { User } from '../../domain/entities/user.entity';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let authService: AuthService;

    const mockUser: User = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        skills: [],
        interests: [],
        favorites: [],
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockAuthService = {
        isTokenBlacklisted: jest.fn(),
        verifyToken: jest.fn(),
        validateUserById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {
                        authorization: authHeader,
                    },
                    user: undefined,
                }),
            }),
        } as ExecutionContext;
    };

    describe('canActivate', () => {
        it('should allow access with valid token', async () => {
            const context = createMockExecutionContext('Bearer valid-token');
            mockAuthService.isTokenBlacklisted.mockResolvedValue(false);
            mockAuthService.verifyToken.mockReturnValue({ sub: mockUser._id });
            mockAuthService.validateUserById.mockResolvedValue(mockUser);

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
            expect(authService.isTokenBlacklisted).toHaveBeenCalledWith('valid-token');
            expect(authService.verifyToken).toHaveBeenCalledWith('valid-token');
            expect(authService.validateUserById).toHaveBeenCalledWith(mockUser._id);
        });

        it('should throw UnauthorizedException when no token provided', async () => {
            const context = createMockExecutionContext();

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('No token provided'),
            );
        });

        it('should throw UnauthorizedException when token is blacklisted', async () => {
            const context = createMockExecutionContext('Bearer blacklisted-token');
            mockAuthService.isTokenBlacklisted.mockResolvedValue(true);

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('Token has been invalidated'),
            );
            expect(authService.isTokenBlacklisted).toHaveBeenCalledWith('blacklisted-token');
        });

        it('should throw UnauthorizedException when token verification fails', async () => {
            const context = createMockExecutionContext('Bearer invalid-token');
            mockAuthService.isTokenBlacklisted.mockResolvedValue(false);
            mockAuthService.verifyToken.mockImplementation(() => {
                throw new Error('Token verification failed');
            });

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('Invalid token'),
            );
        });

        it('should throw UnauthorizedException when user not found', async () => {
            const context = createMockExecutionContext('Bearer valid-token');
            mockAuthService.isTokenBlacklisted.mockResolvedValue(false);
            mockAuthService.verifyToken.mockReturnValue({ sub: 'nonexistent-user-id' });
            mockAuthService.validateUserById.mockResolvedValue(null);

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('User not found'),
            );
        });

        it('should attach user to request when authentication succeeds', async () => {
            const mockRequest = {
                headers: {
                    authorization: 'Bearer valid-token',
                },
                user: undefined,
            };
            const context = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
            } as ExecutionContext;

            mockAuthService.isTokenBlacklisted.mockResolvedValue(false);
            mockAuthService.verifyToken.mockReturnValue({ sub: mockUser._id });
            mockAuthService.validateUserById.mockResolvedValue(mockUser);

            await guard.canActivate(context);

            expect(mockRequest.user).toEqual(mockUser);
        });

        it('should reject token without Bearer prefix', async () => {
            const context = createMockExecutionContext('invalid-format-token');

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('No token provided'),
            );
        });

        it('should reject malformed authorization header', async () => {
            const context = createMockExecutionContext('Bearer');

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('No token provided'),
            );
        });

        it('should propagate UnauthorizedException from token blacklist check', async () => {
            const context = createMockExecutionContext('Bearer token');
            mockAuthService.isTokenBlacklisted.mockRejectedValue(
                new UnauthorizedException('Database error'),
            );

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('Database error'),
            );
        });
    });

    describe('extractTokenFromHeader', () => {
        it('should extract token with Bearer prefix', async () => {
            const context = createMockExecutionContext('Bearer test-token-123');
            mockAuthService.isTokenBlacklisted.mockResolvedValue(false);
            mockAuthService.verifyToken.mockReturnValue({ sub: mockUser._id });
            mockAuthService.validateUserById.mockResolvedValue(mockUser);

            await guard.canActivate(context);

            expect(authService.verifyToken).toHaveBeenCalledWith('test-token-123');
        });

        it('should return undefined when authorization header is missing', async () => {
            const context = createMockExecutionContext();

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
            expect(authService.isTokenBlacklisted).not.toHaveBeenCalled();
        });

        it('should return undefined when token type is not Bearer', async () => {
            const context = createMockExecutionContext('Basic token-123');

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('No token provided'),
            );
        });
    });
});
