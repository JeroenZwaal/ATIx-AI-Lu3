import AppRoutes from './AppRoutes.tsx'
import { AuthProvider } from './features/auth/hooks/useAuth.tsx'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
