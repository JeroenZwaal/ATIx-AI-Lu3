import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProfileContextType } from '../types/profile.types';
import { profileService } from '../services/profile.service';
import { PROFILE_CONTEXT } from '../contexts/profileContext';

export function useProfile(): ProfileContextType {
    const context = useContext(PROFILE_CONTEXT);
    const navigate = useNavigate();

    useEffect(() => {
        if (context === undefined) {
            navigate('/profile/createProfile', { replace: true });
        }
    }, [context, navigate]);

    if (context === undefined) {
        return {
            createProfile: async () => {
                throw new Error(
                    'ProfileProvider missing: ensure the app is wrapped with <ProfileProvider>',
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
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setTags([]);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchTags();
    }, []);

    return { tags, isLoading, error };
}
