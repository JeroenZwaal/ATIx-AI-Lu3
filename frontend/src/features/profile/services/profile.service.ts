import { environment } from '../../../shared/environments/environment';
import type { UpdateProfileResponse, CreateProfileDto, ProfileApi } from '../types/profile.types';

export class ProfileService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }
    async createProfile(createProfileData: CreateProfileDto): Promise<UpdateProfileResponse> {
        console.log('test in api call');
        const newUser: ProfileApi = {
            studyProgram: createProfileData.opleiding,
            ...(createProfileData.studielocatie && {
                studyLocation: createProfileData.studielocatie,
            }),
            studyCredits: Number(createProfileData.studiepunten),
            yearOfStudy: Number(createProfileData.leerjaar),
            skills: createProfileData.skills,
            interests: createProfileData.interests,
        };
        console.log('Creating profile with data:', newUser);
        const response = await fetch(`${environment.apiUrl}/user/updateProfile`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(newUser),
        });

        if (!response.ok) {
            let errorText = 'Create profile failed';
            try {
                const error = await response.json();
                errorText = error.message || errorText;
            } catch {
                // ignore JSON parse errors
            }
            throw new Error(errorText);
        }

        return response.json();
    }

    async getUserProfile(): Promise<ProfileApi> {
        const response = await fetch(`${environment.apiUrl}/user/getProfile`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            let errorText = 'Get profile failed';
            try {
                const error = await response.json();
                errorText = error.message || errorText;
            } catch {
                // ignore JSON parse errors
            }
            throw new Error(errorText);
        }

        return response.json();
    }

    async getAllTags(): Promise<string[]> {
        const response = await fetch(`${environment.apiUrl}/modules/getAllTags`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            let errorText = 'Get tags failed';
            try {
                const error = await response.json();
                errorText = error.message || errorText;
            } catch {
                // ignore JSON parse errors
            }
            throw new Error(errorText);
        }

        return response.json();
    }
}

export const profileService = new ProfileService();
