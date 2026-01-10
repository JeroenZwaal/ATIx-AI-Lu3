import { nl } from './nl';
import { en } from './en';

export type Locale = typeof nl;
export type Language = 'nl' | 'en';

export const locales: Record<Language, Locale> = {
    nl,
    en,
};

export { nl, en };
