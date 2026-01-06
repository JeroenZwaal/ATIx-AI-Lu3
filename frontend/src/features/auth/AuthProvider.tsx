import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from './types/auth.types';
import { authService } from './services/auth.service';
import { AUTH_CONTEXT } from './AuthContext';

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load token from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            try {
                const parts = savedToken.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    if (payload.exp && payload.exp * 1000 > Date.now()) {
                        setToken(savedToken);
                    } else {
                        localStorage.removeItem('token');
                    }
                } else {
                    localStorage.removeItem('token');
                }
            } catch {
                localStorage.removeItem('token');
            }
        }
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login({
                email,
                passwordHash: password,
            });

            setUser(response.user);
            setToken(response.access_token);
            localStorage.setItem('token', response.access_token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.register({
                firstName,
                lastName,
                email,
                passwordHash: password,
            });

            setUser(response.user);
            setToken(response.access_token);
            localStorage.setItem('token', response.access_token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        await authService.logout();
        setUser(null);
        setToken(null);
        setError(null);
        localStorage.removeItem('token');
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        register,
        logout,
        isLoading,
        error,
    };

    return <AUTH_CONTEXT.Provider value={value}>{children}</AUTH_CONTEXT.Provider>;
}
