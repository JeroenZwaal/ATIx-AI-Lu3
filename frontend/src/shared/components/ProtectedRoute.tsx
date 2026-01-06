import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.tsx';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

function isValidToken(token: string | null): boolean {
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

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { token } = useAuth();

    const storedToken = localStorage.getItem('token');
    const currentToken = token || storedToken;

    if (!currentToken) {
        return <Navigate to="/login" replace />;
    }

    const isValid = isValidToken(currentToken);
    if (!isValid) {
        if (storedToken) {
            localStorage.removeItem('token');
        }
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
