import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ProfileContextType, CreateProfileDto, UpdateProfileResponse } from '../types/profile.types';
import { profileService } from '../services/profile.service';
import { useNavigate } from 'react-router-dom';


// Create profile context
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Profile provider component
export function ProfileProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function createProfile(createProfileData: CreateProfileDto): Promise<UpdateProfileResponse> {
        setIsLoading(true);
        setError(null);
        try {
            const res = await profileService.createProfile(createProfileData);
            return res;
        } catch (err: any) {
            setError(err?.message ?? 'Unknown error');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const value = useMemo<ProfileContextType>(() => ({ createProfile }), []);

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}


// Custom hook to use profile context
export function useProfile(): ProfileContextType {
    const context = useContext(ProfileContext);
    const navigate = useNavigate();
            console.log(context);

    useEffect(() => {
        if (context === undefined) {
            // If the profile context is missing, send the user to the profile creation page
            // rather than trying to navigate back (which can lead to a blank page when
            // there is no previous history entry).
            navigate('/profile/createProfile', { replace: true });
        }
    }, [context, navigate]);

    if (context === undefined) {
        // Return a safe stub that rejects when used — avoids runtime crashes while
        // still providing a helpful error message for debugging.
        return {
            createProfile: async () => {
                return Promise.reject(new Error('ProfileProvider missing: ensure the app is wrapped with <ProfileProvider>'));
            },
        };
    }

    return context;
}