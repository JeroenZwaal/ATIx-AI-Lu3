import { useState } from 'react';
import { useLanguage } from '../../../shared/contexts/useLanguage';

export default function Settings() {
    const { language, setLanguage, t } = useLanguage();
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
        return saved || 'dark';
    });

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div className="min-h-screen bg-neutral-950 w-full overflow-x-hidden">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-white mb-4 text-center">{t.settings.title}</h1>

                <p className="text-gray-300 mb-8 text-center max-w-3xl mx-auto">
                    {t.settings.description}
                </p>

                <div className="space-y-6 max-w-3xl mx-auto">
                    {/* Taal Instelling */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-4">{t.settings.language.title}</h2>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setLanguage('nl')}
                                style={{ backgroundColor: language === 'nl' ? '#c4b5fd' : '' }}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                                    language === 'nl'
                                        ? 'text-black hover:bg-violet-400'
                                        : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                                }`}
                            >
                                {t.settings.language.dutch}
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                style={{ backgroundColor: language === 'en' ? '#c4b5fd' : '' }}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                                    language === 'en'
                                        ? 'text-black hover:bg-violet-400'
                                        : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                                }`}
                            >
                                {t.settings.language.english}
                            </button>
                        </div>
                    </div>

                    {/* Theme Instelling */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-4">{t.settings.theme.title}</h2>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleThemeChange('light')}
                                style={{ backgroundColor: theme === 'light' ? '#c4b5fd' : '' }}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                                    theme === 'light'
                                        ? 'text-black hover:bg-violet-400'
                                        : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                                }`}
                            >
                                {t.settings.theme.light}
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                style={{ backgroundColor: theme === 'dark' ? '#c4b5fd' : '' }}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                                    theme === 'dark'
                                        ? 'text-black hover:bg-violet-400'
                                        : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
                                }`}
                            >
                                {t.settings.theme.dark}
                            </button>
                        </div>
                    </div>

                    {/* LocalStorage Status */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-4">{t.settings.localStorage.title}</h2>

                        <div className="space-y-3">
                            <div className="bg-neutral-900 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 font-medium">{t.settings.localStorage.language}</span>
                                    <span className="text-violet-400 font-mono font-semibold">
                                        "{language}"
                                    </span>
                                </div>
                            </div>

                            <div className="bg-neutral-900 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 font-medium">{t.settings.localStorage.theme}</span>
                                    <span className="text-violet-400 font-mono font-semibold">
                                        "{theme}"
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-500 text-sm mt-4 text-center">
                            {t.settings.localStorage.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
