import AppRoutes from './AppRoutes.tsx';
import { AuthProvider } from './features/auth/AuthProvider.tsx';
import { LanguageProvider } from './shared/contexts/LanguageContext.tsx';
import { ThemeProvider } from './shared/contexts/ThemeContext.tsx';
import { ProfileProvider } from './features/profile/hooks/useProfile.tsx';

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AuthProvider>
                    <ProfileProvider>
                        <AppRoutes />
                    </ProfileProvider>
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
