import { createContext } from 'react';
import type { AuthContextType } from './types/auth.types';

// Create auth context
export const AUTH_CONTEXT = createContext<AuthContextType | undefined>(undefined);
