import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
    ProfileContextType,
    CreateProfileDto,
    UpdateProfileResponse,
    ProfileApi,
} from '../types/profile.types';
import { profileService } from '../services/profile.service';
import { useNavigate } from 'react-router-dom';

// Create profile context
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Profile provider component
export function ProfileProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<CreateProfileDto> | null>(null);

    // Holds the last-fetched profile from the backend
    const [userProfile, setUserProfile] = useState<ProfileApi | null>(null);

    async function fetchUserProfile(): Promise<ProfileApi | null> {
        setIsLoading(true);
        setError(null);
        try {
            const res = await profileService.getUserProfile();
            setUserProfile(res);
            return res;
        } catch (err: any) {
            setError(err?.message ?? 'Unknown error');
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    async function createProfile(
        createProfileData: CreateProfileDto,
    ): Promise<UpdateProfileResponse> {
        setIsLoading(true);
        setError(null);
        try {
            const res = await profileService.createProfile(createProfileData);
            // clear draft after successful creation
            setDraft(null);

            // refresh the stored profile so pages get the newest values
            await fetchUserProfile();

            return res;
        } catch (err: any) {
            setError(err?.message ?? 'Unknown error');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    // Try to fetch the profile on mount so it's available to pages that consume the context
    // (silently ignore failures; components can call fetchUserProfile explicitly if needed)
    useEffect(() => {
        // Fire-and-forget
        fetchUserProfile().catch(() => {});
    }, []);

    const value = useMemo<ProfileContextType>(
        () => ({ createProfile, draft, setDraft, userProfile, fetchUserProfile, isLoading, error }),
        [createProfile, draft, userProfile, isLoading, error],
    );

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

// Custom hook to use profile context
export function useProfile(): ProfileContextType {
    const context = useContext(ProfileContext);
    const navigate = useNavigate();
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
                return Promise.reject(
                    new Error(
                        'ProfileProvider missing: ensure the app is wrapped with <ProfileProvider>',
                    ),
                );
            },
            draft: null,
            setDraft: () => {
                /* no-op fallback */
            },
            userProfile: null,
            fetchUserProfile: async () => null,
            isLoading: false,
            error: null,
        };
    }

    return context;
}

export function useGetAllTags() {
    const [tags, setTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTags = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await profileService.getAllTags();
                setTags(data);
            } catch (err: any) {
                setError(err?.message ?? 'Unknown error');
                setTags([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTags();
    }, []);

    return { tags, isLoading, error };
}
