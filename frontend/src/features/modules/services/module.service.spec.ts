/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { moduleService } from './module.service';
import { environment } from '../../../shared/environments/environment';

globalThis.fetch = vi.fn();

describe('ModuleService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const mockModule = {
        id: '1',
        name: 'Test Module',
        description: 'Test description',
        studycredit: 5,
        level: 'NLQF5',
        location: 'Amsterdam',
        tags: ['programming'],
    };

    describe('getAllModules', () => {
        it('should fetch all modules successfully', async () => {
            localStorage.setItem('token', 'test-token');
            const mockModules = [mockModule];

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockModules,
            });

            const result = await moduleService.getAllModules();

            expect(result).toEqual(mockModules);
            expect(globalThis.fetch).toHaveBeenCalledWith(`${environment.apiUrl}/modules`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer test-token',
                },
            });
        });

        it('should throw error when endpoint not found', async () => {
            localStorage.setItem('token', 'test-token');

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });

            await expect(moduleService.getAllModules()).rejects.toThrow(
                'Module endpoint not found',
            );
        });

        it('should throw error when fetch fails', async () => {
            localStorage.setItem('token', 'test-token');

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => ({ message: 'Server error' }),
            });

            await expect(moduleService.getAllModules()).rejects.toThrow('Server error');
        });

        it('should handle network errors', async () => {
            localStorage.setItem('token', 'test-token');

            (globalThis.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

            await expect(moduleService.getAllModules()).rejects.toThrow(
                'Cannot connect to backend',
            );
        });
    });

    describe('getModuleById', () => {
        it('should fetch module by id successfully', async () => {
            localStorage.setItem('token', 'test-token');

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockModule,
            });

            const result = await moduleService.getModuleById('1');

            expect(result).toEqual(mockModule);
            expect(globalThis.fetch).toHaveBeenCalledWith(`${environment.apiUrl}/modules/1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer test-token',
                },
            });
        });

        it('should throw error when module not found', async () => {
            localStorage.setItem('token', 'test-token');

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Module not found' }),
            });

            await expect(moduleService.getModuleById('999')).rejects.toThrow('Module not found');
        });
    });

    describe('getModuleByExternalId', () => {
        it('should fetch module by external id successfully', async () => {
            localStorage.setItem('token', 'test-token');

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockModule,
            });

            const result = await moduleService.getModuleByExternalId(123);

            expect(result).toEqual(mockModule);
            expect(globalThis.fetch).toHaveBeenCalledWith(
                `${environment.apiUrl}/modules/external/123`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token',
                    },
                },
            );
        });

        it('should return null when module not found', async () => {
            localStorage.setItem('token', 'test-token');

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => null,
            });

            const result = await moduleService.getModuleByExternalId(999);

            expect(result).toBeNull();
        });
    });

    describe('searchModules', () => {
        it('should search modules successfully', async () => {
            localStorage.setItem('token', 'test-token');
            const mockModules = [mockModule];

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockModules,
            });

            const result = await moduleService.searchModules('programming');

            expect(result).toEqual(mockModules);
            expect(globalThis.fetch).toHaveBeenCalledWith(
                `${environment.apiUrl}/modules/search?q=programming`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token',
                    },
                },
            );
        });

        it('should encode special characters in search query', async () => {
            localStorage.setItem('token', 'test-token');

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            });

            await moduleService.searchModules('test & special');

            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining('test%20%26%20special'),
                expect.any(Object),
            );
        });

        it('should throw error when search fails', async () => {
            localStorage.setItem('token', 'test-token');

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Search failed' }),
            });

            await expect(moduleService.searchModules('test')).rejects.toThrow('Search failed');
        });
    });

    describe('getAuthHeaders', () => {
        it('should include auth token from localStorage', async () => {
            localStorage.setItem('token', 'test-token-123');

            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            });

            await moduleService.getAllModules();

            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token-123',
                    }),
                }),
            );
        });

        it('should work without auth token', async () => {
            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            });

            await moduleService.getAllModules();

            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                }),
            );
        });
    });
});
