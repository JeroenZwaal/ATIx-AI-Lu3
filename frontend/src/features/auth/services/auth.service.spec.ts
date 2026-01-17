/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import authService from './auth.service';
import { environment } from '../../../shared/environments/environment';

globalThis.fetch = vi.fn();

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('login', () => {
        it('should login successfully and return token', async () => {
            const mockResponse = {
                access_token: 'test-token-123',
                user: { email: 'test@example.com', firstName: 'Test', lastName: 'User' },
            };

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await authService.login({
                email: 'test@example.com',
                passwordHash: 'password123',
            });

            expect(result).toEqual(mockResponse);
            expect(globalThis.fetch).toHaveBeenCalledWith(`${environment.apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com', passwordHash: 'password123' }),
            });
        });

        it('should throw error when login fails', async () => {
            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Invalid credentials' }),
            });

            await expect(
                authService.login({ email: 'test@example.com', passwordHash: 'wrong' }),
            ).rejects.toThrow('Invalid credentials');
        });
    });

    describe('register', () => {
        it('should register successfully', async () => {
            const mockResponse = {
                access_token: 'test-token-123',
                user: { email: 'test@example.com', firstName: 'Test', lastName: 'User' },
            };

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await authService.register({
                email: 'test@example.com',
                passwordHash: 'password123',
                firstName: 'Test',
                lastName: 'User',
            });

            expect(result).toEqual(mockResponse);
        });

        it('should throw error when registration fails', async () => {
            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'User already exists' }),
            });

            await expect(
                authService.register({
                    email: 'test@example.com',
                    passwordHash: 'password123',
                    firstName: 'Test',
                    lastName: 'User',
                }),
            ).rejects.toThrow('REGISTRATION_FAILED');
        });
    });

    describe('logout', () => {
        it('should logout and remove token', async () => {
            localStorage.setItem('token', 'test-token');
            (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });

            await authService.logout();

            expect(localStorage.getItem('token')).toBeNull();
        });

        it('should remove token even if logout request fails', async () => {
            localStorage.setItem('token', 'test-token');
            (globalThis.fetch as any).mockRejectedValueOnce(new Error('Network error'));

            await authService.logout();

            expect(localStorage.getItem('token')).toBeNull();
        });
    });

    describe('token management', () => {
        it('should save token to localStorage', () => {
            authService.saveToken('test-token');
            expect(localStorage.getItem('token')).toBe('test-token');
        });

        it('should get token from localStorage', () => {
            localStorage.setItem('token', 'test-token');
            expect(authService.getToken()).toBe('test-token');
        });

        it('should remove token from localStorage', () => {
            localStorage.setItem('token', 'test-token');
            authService.removeToken();
            expect(localStorage.getItem('token')).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        it('should return false when no token', () => {
            expect(authService.isAuthenticated()).toBe(false);
        });

        it('should return false when token is malformed', () => {
            localStorage.setItem('token', 'invalid-token');
            expect(authService.isAuthenticated()).toBe(false);
        });

        it('should return false when token is expired', () => {
            const expiredToken = createMockToken(Date.now() / 1000 - 3600); // Expired 1 hour ago
            localStorage.setItem('token', expiredToken);
            expect(authService.isAuthenticated()).toBe(false);
        });

        it('should return true when token is valid', () => {
            const validToken = createMockToken(Date.now() / 1000 + 3600); // Expires in 1 hour
            localStorage.setItem('token', validToken);
            expect(authService.isAuthenticated()).toBe(true);
        });
    });

    describe('getFavorites', () => {
        it('should fetch favorites successfully', async () => {
            const mockFavorites = [{ id: '1', name: 'Module 1', description: 'Test module' }];
            localStorage.setItem('token', 'test-token');

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockFavorites,
            });

            const result = await authService.getFavorites();

            expect(result).toEqual(mockFavorites);
            expect(globalThis.fetch).toHaveBeenCalledWith(`${environment.apiUrl}/user/favorites`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer test-token',
                },
            });
        });

        it('should throw error when fetch fails', async () => {
            localStorage.setItem('token', 'test-token');
            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Failed to fetch' }),
            });

            await expect(authService.getFavorites()).rejects.toThrow('Failed to fetch');
        });
    });
});

// Helper function to create mock JWT tokens
function createMockToken(exp: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: 'user123', exp }));
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
}
