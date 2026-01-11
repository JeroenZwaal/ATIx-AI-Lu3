import { createContext } from 'react';

export type Theme = 'light' | 'dark';
export type ThemeContextType = {
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
