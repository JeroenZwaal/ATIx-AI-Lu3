import { environment } from '../../../shared/environments/environment';
import type { UpdateProfileResponse, CreateProfileDto } from '../types/profile.types';

export class ProfileService {
    async createProfile(createProfileData: CreateProfileDto): Promise<UpdateProfileResponse> {
        const response = await fetch(`${environment.apiUrl}/auth/createProfile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(createProfileData),
        });

        if (!response.ok) {
            let errorText = 'Create profile failed';
            try {
                const error = await response.json();
                errorText = error.message || errorText;
            } catch (_) {
                // ignore JSON parse errors
            }
            throw new Error(errorText);
        }

        return response.json();
    }
}

export const profileService = new ProfileService();
