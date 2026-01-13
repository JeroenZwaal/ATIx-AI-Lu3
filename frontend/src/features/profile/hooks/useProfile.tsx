import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext, ProfileContextType } from '../context/ProfileContext';

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
