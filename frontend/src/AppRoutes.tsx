import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/login';
import RegisterPage from './features/auth/pages/register';
import ProtectedRoute from './shared/components/ProtectedRoute';
import KeuzemodulesPage from './features/modules/pages/keuzemodules';

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
                            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                                <h1 className="text-white text-4xl">Dashboard - Coming Soon</h1>
                            </div>
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

                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
