import AppRoutes from './AppRoutes.tsx';
import { AuthProvider } from './features/auth/AuthProvider.tsx';
import { LanguageProvider } from './shared/contexts/LanguageContext.tsx';

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;
