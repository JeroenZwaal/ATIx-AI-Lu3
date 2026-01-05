import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import PersonalInfo from './pages/profile/personalInfo'
import SkillsAndIntrests from './pages/profile/skillsAndIntrests'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="profile/createProfile" element={<PersonalInfo />} />
        <Route path="profile/skillsAndIntrests" element={<SkillsAndIntrests />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
