import AppRoutes from './AppRoutes.tsx';
import { AuthProvider } from './features/auth/AuthProvider.tsx';
import { LanguageProvider } from './shared/contexts/LanguageContext.tsx';
import { ProfileProvider } from './features/profile/hooks/useProfile.tsx';

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <ProfileProvider>
                    <AppRoutes />
                </ProfileProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;
