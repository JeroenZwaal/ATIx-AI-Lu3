import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
    CreateProfileDto,
    ProfileApi,
    ProfileContextType,
    UpdateProfileResponse,
} from '../types/profile.types';
import { profileService } from '../services/profile.service';
import { PROFILE_CONTEXT } from '../contexts/profileContext';
import { useAuth } from '../../auth/hooks/useAuth';

export function ProfileProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<CreateProfileDto> | null>(null);

    // Holds the last-fetched profile from the backend
    const [userProfile, setUserProfile] = useState<ProfileApi | null>(null);

    // Tracks which auth token the current cached profile belongs to.
    // Prevents briefly showing a previous user's profile after switching accounts.
    const [profileToken, setProfileToken] = useState<string | null>(null);

    const effectiveUserProfile = token === profileToken ? userProfile : null;

    const fetchUserProfile = useCallback(async (): Promise<ProfileApi | null> => {
        if (!token) {
            setUserProfile(null);
            return null;
        }
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
    }, [token]);

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

    // Keep profile state in sync with authentication.
    // - On logout: clear cached profile and draft.
    // - On login / token change: clear cached profile and refetch.
    useEffect(() => {
        setProfileToken(token);
        setUserProfile(null);
        setDraft(null);
        setError(null);

        if (token) {
            void fetchUserProfile();
        }
    }, [token, fetchUserProfile]);

    const value = useMemo<ProfileContextType>(
        () => ({
            createProfile,
            draft,
            setDraft,
            userProfile: effectiveUserProfile,
            fetchUserProfile,
            isLoading,
            error,
        }),
        [createProfile, draft, effectiveUserProfile, fetchUserProfile, isLoading, error],
    );

    return <PROFILE_CONTEXT.Provider value={value}>{children}</PROFILE_CONTEXT.Provider>;
}
