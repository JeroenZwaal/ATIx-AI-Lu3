import { environment } from '../../../shared/environments/environment';
import type { Module } from '../../../shared/types/index';

class ModuleService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async getAllModules(): Promise<Module[]> {
        try {
            const response = await fetch(`${environment.apiUrl}/modules`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(
                        'Module endpoint not found. Backend controller may be missing.',
                    );
                }
                const error = await response
                    .json()
                    .catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
                throw new Error(error.message || 'Failed to fetch modules');
            }

            return response.json();
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Cannot connect to backend. Is the server running?');
            }
            throw error;
        }
    }

    async getModuleById(id: string): Promise<Module> {
        const response = await fetch(`${environment.apiUrl}/modules/${id}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch module');
        }

        return response.json();
    }

    async searchModules(query: string): Promise<Module[]> {
        const response = await fetch(
            `${environment.apiUrl}/modules/search?q=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: this.getAuthHeaders(),
            },
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to search modules');
        }

        return response.json();
    }

    async getFavorites(): Promise<string[]> {
        const response = await fetch(`${environment.apiUrl}/modules/favorites`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to get favorites');
        }
        const modules = await response.json();
        return modules.map((module: Module) => module.id);
    }

    async saveFavorite(moduleId: string): Promise<void> {
        const response = await fetch(`${environment.apiUrl}/modules/favorite/${moduleId}`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ message: 'Failed to save favorite' }));
            throw new Error(error.message || 'Failed to save favorite');
        }
        // Don't try to parse empty response
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return;
        }
        const text = await response.text();
        if (!text) {
            return;
        }
        return JSON.parse(text);
    }

    async removeFavorite(moduleId: string): Promise<void> {
        const response = await fetch(`${environment.apiUrl}/modules/favorite/${moduleId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ message: 'Failed to remove favorite' }));
            throw new Error(error.message || 'Failed to remove favorite');
        }
        // Don't try to parse empty response
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return;
        }
        const text = await response.text();
        if (!text) {
            return;
        }
        return JSON.parse(text);
    }
}

export const moduleService = new ModuleService();
export default moduleService;
