import { useContext } from 'react';
import type { AuthContextType } from '../types/auth.types';
import { AUTH_CONTEXT } from '../AuthContext';

// Custom hook to use auth context
export function useAuth(): AuthContextType {
    const context = useContext(AUTH_CONTEXT);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
