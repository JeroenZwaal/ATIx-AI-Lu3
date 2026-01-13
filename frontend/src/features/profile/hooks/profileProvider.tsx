import { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
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
const PROFILECONTEXT = createContext<ProfileContextType | undefined>(undefined);

// Profile provider component
export function ProfileProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<CreateProfileDto> | null>(null);

    // Holds the last-fetched profile from the backend
    const [userProfile, setUserProfile] = useState<ProfileApi | null>(null);

    const fetchUserProfile = useCallback(async (): Promise<ProfileApi | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await profileService.getUserProfile();
            setUserProfile(res);
            return res;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createProfile = useCallback(
        async (createProfileData: CreateProfileDto): Promise<UpdateProfileResponse> => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await profileService.createProfile(createProfileData);
                // clear draft after successful creation
                setDraft(null);

                // refresh the stored profile so pages get the newest values
                await fetchUserProfile();

                return res;
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [fetchUserProfile],
    );

    // Try to fetch the profile on mount so it's available to pages that consume the context
    // (silently ignore failures; components can call fetchUserProfile explicitly if needed)
    useEffect(() => {
        // Fire-and-forget
        fetchUserProfile().catch(() => {});
    }, [fetchUserProfile]);

    const value = useMemo<ProfileContextType>(
        () => ({ createProfile, draft, setDraft, userProfile, fetchUserProfile, isLoading, error }),
        [createProfile, draft, userProfile, fetchUserProfile, isLoading, error],
    );

    return <PROFILECONTEXT.Provider value={value}>{children}</PROFILECONTEXT.Provider>;
}
