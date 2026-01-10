import { createContext } from 'react';
import type { Locale, Language } from '../locales';

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Locale;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
