import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/login';
import RegisterPage from './features/auth/pages/register';
import DashboardPage from './features/dashboard/pages/dashboard';
import ProtectedRoute from './shared/components/ProtectedRoute';
import KeuzemodulesPage from './features/modules/pages/keuzemodules';
import PersonalInfo from './features/profile/pages/personalInfo';
import SkillsAndIntrests from './features/profile/pages/skillsAndIntrests';
import ModuleDetailPage from './features/modules/pages/moduledetail';
import SettingsPage from './features/settings/pages/Settings';
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
                <Route path="/profile/createProfile" element={<PersonalInfo />} />
                <Route path="/profile/skillsAndIntrests" element={<SkillsAndIntrests />} />
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
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>

                <Route path="/logout" element={<LogoutRedirect />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
