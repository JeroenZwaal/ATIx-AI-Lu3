/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.auth.guard';
import { LoginDto, RegisterDto, AuthResponseDto } from '../presenters/auth.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthResponse: AuthResponseDto = {
        access_token: 'test-jwt-token',
        user: {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
        },
    };

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        invalidateToken: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const registerDto: RegisterDto = {
                email: 'test@example.com',
                passwordHash: 'password123',
                firstName: 'Test',
                lastName: 'User',
            };
            mockAuthService.register.mockResolvedValue(mockAuthResponse);

            const result = await controller.register(registerDto);

            expect(result).toEqual(mockAuthResponse);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });

        it('should throw error when registration fails', async () => {
            const registerDto: RegisterDto = {
                email: 'existing@example.com',
                passwordHash: 'password123',
                firstName: 'Test',
                lastName: 'User',
            };
            mockAuthService.register.mockRejectedValue(new Error('User already exists'));

            await expect(controller.register(registerDto)).rejects.toThrow('User already exists');
        });
    });

    describe('login', () => {
        it('should login user with valid credentials', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                passwordHash: 'password123',
            };
            mockAuthService.login.mockResolvedValue(mockAuthResponse);

            const result = await controller.login(loginDto);

            expect(result).toEqual(mockAuthResponse);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });

        it('should throw error when login fails', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                passwordHash: 'wrongpassword',
            };
            mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

            await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
        });
    });

    describe('logout', () => {
        it('should logout user and invalidate token', async () => {
            const authHeader = 'Bearer test-jwt-token';
            mockAuthService.invalidateToken.mockResolvedValue(undefined);

            const result = await controller.logout(authHeader);

            expect(result).toEqual({ message: 'Logged out successfully' });
            expect(authService.invalidateToken).toHaveBeenCalledWith('test-jwt-token');
        });

        it('should handle logout without Bearer prefix', async () => {
            const authHeader = 'test-jwt-token';
            mockAuthService.invalidateToken.mockResolvedValue(undefined);

            const result = await controller.logout(authHeader);

            expect(result).toEqual({ message: 'Logged out successfully' });
            expect(authService.invalidateToken).toHaveBeenCalledWith('test-jwt-token');
        });

        it('should not call invalidateToken when no auth header provided', async () => {
            const result = await controller.logout('');

            expect(result).toEqual({ message: 'Logged out successfully' });
            expect(authService.invalidateToken).not.toHaveBeenCalled();
        });
    });
});
