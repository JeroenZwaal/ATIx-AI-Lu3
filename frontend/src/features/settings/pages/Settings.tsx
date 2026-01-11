import { useLanguage } from '../../../shared/contexts/useLanguage';
import { useTheme } from '../../../shared/contexts/useTheme';

export default function Settings() {
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();

    return (
        <div className="w-full overflow-x-hidden theme-page">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold theme-text-primary mb-4 text-center">{t.settings.title}</h1>

                <p className="theme-text-secondary mb-8 text-center max-w-3xl mx-auto">
                    {t.settings.description}
                </p>

                <div className="space-y-6 max-w-3xl mx-auto">
                    {/* Taal Instelling */}
                    <div className="theme-card rounded-lg p-6">
                        <h2 className="text-xl font-bold theme-text-primary mb-4">{t.settings.language.title}</h2>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setLanguage('nl')}
                                style={{ backgroundColor: language === 'nl' ? 'var(--accent)' : '' }}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                                    language === 'nl'
                                        ? 'text-black hover:opacity-80'
                                        : 'theme-button-secondary'
                                }`}
                            >
                                {t.settings.language.dutch}
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                style={{ backgroundColor: language === 'en' ? 'var(--accent)' : '' }}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                                    language === 'en'
                                        ? 'text-black hover:opacity-80'
                                        : 'theme-button-secondary'
                                }`}
                            >
                                {t.settings.language.english}
                            </button>
                        </div>
                    </div>

                    {/* Theme Instelling */}
                    <div className="theme-card rounded-lg p-6">
                        <h2 className="text-xl font-bold theme-text-primary mb-4">{t.settings.theme.title}</h2>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setTheme('light')}
                                style={{ backgroundColor: theme === 'light' ? 'var(--accent)' : '' }}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                                    theme === 'light'
                                        ? 'text-black hover:opacity-80'
                                        : 'theme-button-secondary'
                                }`}
                            >
                                {t.settings.theme.light}
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                style={{ backgroundColor: theme === 'dark' ? 'var(--accent)' : '' }}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                                    theme === 'dark'
                                        ? 'text-black hover:opacity-80'
                                        : 'theme-button-secondary'
                                }`}
                            >
                                {t.settings.theme.dark}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
