import { useState, useEffect, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './ThemeContextDef';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(
        () => (localStorage.getItem('theme') as Theme) || 'dark',
    );

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem('theme', t);
    };

    useEffect(() => {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(theme);
    }, [theme]);

    useEffect(() => {
        const onStorage = (e: StorageEvent) =>
            e.key === 'theme' && e.newValue && setThemeState(e.newValue as Theme);
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}
