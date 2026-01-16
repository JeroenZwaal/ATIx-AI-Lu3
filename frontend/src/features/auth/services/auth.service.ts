import { environment } from '../../../shared/environments/environment';
import type { Module } from '../../../shared/types';
import type { LoginDto, RegisterDto, AuthResponse } from '../types/auth.types';

class AuthService {
    async login(loginData: LoginDto): Promise<AuthResponse> {
        const response = await fetch(`${environment.apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    }

    async register(registerData: RegisterDto): Promise<AuthResponse> {
        const response = await fetch(`${environment.apiUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
        });

        if (!response.ok) {
            // Generieke error om account enumeration te voorkomen
            // Toon altijd dezelfde error message, ongeacht de backend response
            throw new Error('REGISTRATION_FAILED');
        }

        return response.json();
    }

    async logout(): Promise<void> {
        try {
            await fetch(`${environment.apiUrl}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.getToken()}`,
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.removeToken();
        }
    }

    saveToken(token: string): void {
        localStorage.setItem('token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    removeToken(): void {
        localStorage.removeItem('token');
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            const payload = JSON.parse(atob(parts[1]));
            if (!payload.exp) return false;

            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }
    async getFavorites(): Promise<Module[]> {
        const response = await fetch(`${environment.apiUrl}/user/favorites`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.getToken()}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch favorites');
        }

        return response.json();
    }

    async toggleFavorite(moduleId: string, isCurrentlyFavorite: boolean): Promise<void> {
        if (isCurrentlyFavorite) {
            await this.removeFavorite(moduleId);
        } else {
            await this.addFavorite(moduleId);
        }
    }

    async addFavorite(moduleId: string): Promise<void> {
        const response = await fetch(`${environment.apiUrl}/user/favorites/${moduleId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.getToken()}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add favorite');
        }
    }

    async removeFavorite(moduleId: string): Promise<void> {
        const response = await fetch(`${environment.apiUrl}/user/favorites/${moduleId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.getToken()}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove favorite');
        }
    }
}

export const authService = new AuthService();
export default authService;
