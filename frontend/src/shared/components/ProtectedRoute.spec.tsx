import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Navigate: ({ to }: { to: string }) => {
            mockNavigate(to);
            return <div data-testid="navigate">{to}</div>;
        },
    };
});

const mockUseAuth = vi.fn();

vi.mock('../../features/auth/hooks/useAuth.tsx', () => ({
    useAuth: () => mockUseAuth(),
}));

function createMockToken(exp: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: 'user123', exp }));
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
}

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should render children when user is authenticated with valid token', () => {
        const validToken = createMockToken(Date.now() / 1000 + 3600); // Expires in 1 hour
        mockUseAuth.mockReturnValue({ token: validToken });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>,
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render children when valid token is in localStorage', () => {
        const validToken = createMockToken(Date.now() / 1000 + 3600);
        localStorage.setItem('token', validToken);
        mockUseAuth.mockReturnValue({ token: null });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>,
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to login when no token is present', () => {
        mockUseAuth.mockReturnValue({ token: null });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>,
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });

    it('should redirect to login when token is expired', () => {
        const expiredToken = createMockToken(Date.now() / 1000 - 3600); // Expired 1 hour ago
        mockUseAuth.mockReturnValue({ token: expiredToken });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>,
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });

    it('should redirect to login when token is malformed', () => {
        mockUseAuth.mockReturnValue({ token: 'invalid-token' });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>,
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });

    it('should remove expired token from localStorage', () => {
        const expiredToken = createMockToken(Date.now() / 1000 - 3600);
        localStorage.setItem('token', expiredToken);
        mockUseAuth.mockReturnValue({ token: null });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>,
        );

        expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle token without expiration', () => {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ sub: 'user123' })); // No exp field
        const signature = 'mock-signature';
        const tokenWithoutExp = `${header}.${payload}.${signature}`;

        mockUseAuth.mockReturnValue({ token: tokenWithoutExp });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>,
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });

    it('should handle token with only 2 parts', () => {
        mockUseAuth.mockReturnValue({ token: 'header.payload' }); // Missing signature

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>,
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });

    it('should handle token with invalid JSON in payload', () => {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const invalidPayload = 'invalid-json';
        const signature = 'mock-signature';
        const invalidToken = `${header}.${invalidPayload}.${signature}`;

        mockUseAuth.mockReturnValue({ token: invalidToken });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>,
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });
});
