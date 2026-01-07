import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/login';
import RegisterPage from './features/auth/pages/register';
import DashboardPage from './features/auth/pages/dashboard';
import ProtectedRoute from './shared/components/ProtectedRoute';
import KeuzemodulesPage from './features/modules/pages/keuzemodules';

function LogoutRedirect() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/keuzemodules"
                    element={
                        <ProtectedRoute>
                            <KeuzemodulesPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/logout" element={<LogoutRedirect />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
