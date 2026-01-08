import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/login';
import RegisterPage from './features/auth/pages/register';
import DashboardPage from './features/auth/pages/dashboard';
import ProtectedRoute from './shared/components/ProtectedRoute';
import KeuzemodulesPage from './features/modules/pages/keuzemodules';
import ModuleDetailPage from './features/modules/pages/moduledetail';
import Layout from './shared/components/Layout';

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

                {/* Protected routes with Layout */}
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/keuzemodules" element={<KeuzemodulesPage />} />
                    <Route path="/keuzemodules/:id" element={<ModuleDetailPage />} />
                </Route>

                <Route path="/logout" element={<LogoutRedirect />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
