import { createContext } from 'react';
import type { ProfileContextType } from '../types/profile.types';

export const PROFILE_CONTEXT = createContext<ProfileContextType | undefined>(undefined);
