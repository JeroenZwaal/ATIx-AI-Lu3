import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { locales } from '../locales';
import type { Language } from '../locales';
import { LanguageContext } from './LanguageContextDef';

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('language') as Language | null;
        return saved || 'nl';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'language' && e.newValue) {
                setLanguageState(e.newValue as Language);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const t = locales[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}
