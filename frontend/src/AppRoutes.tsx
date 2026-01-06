// Main app routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/login';
import RegisterPage from './features/auth/pages/register';
import PersonalInfo from './features/profile/pages/personalInfo'
import SkillsAndIntrests from './features/profile/pages/skillsAndIntrests'

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="profile/createProfile" element={<PersonalInfo />} />
        <Route path="profile/skillsAndIntrests" element={<SkillsAndIntrests />} />
        
        <Route 
          path="/dashboard" 
          element={
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
              <h1 className="text-white text-4xl">Dashboard - Coming Soon</h1>
            </div>
          } 
        />

                <Route
                    path="/dashboard"
                    element={
                        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                            <h1 className="text-white text-4xl">Dashboard - Coming Soon</h1>
                        </div>
                    }
                />

                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
