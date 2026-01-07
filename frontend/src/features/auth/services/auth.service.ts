import { environment } from '../../../shared/environments/environment';
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
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
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
}

export const authService = new AuthService();
export default authService;
