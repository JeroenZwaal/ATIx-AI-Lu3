export interface CreateProfileDto {
    opleiding: string;
    leerjaar: string;
    studielocatie: string;
    studiepunten: string;
    skills: string[];
    interests: string[];
}

export interface ProfileApi {
    studyProgram: string;
    studyLocation?: string;
    studyCredits: number;
    yearOfStudy: number;
    skills: string[];
    interests: string[];
}

export interface UpdateProfileResponse {
    access_token: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface PersonalInfo {
    opleiding: string | null;
    leerjaar: string | null;
    studielocatie: string | null;
    studiepunten: number | null;
    skills: string[] | null;
    interests: string[] | null;
}

export interface ProfileContextType {
    createProfile: (createProfileData: CreateProfileDto) => Promise<UpdateProfileResponse>;
    draft: Partial<CreateProfileDto> | null;
    setDraft: (draft: Partial<CreateProfileDto> | null) => void;

    /** Latest profile as returned by the API (or null if not fetched) */
    userProfile: ProfileApi | null;
    /** Fetches the profile from the API and stores it in context (returns null on error) */
    fetchUserProfile: () => Promise<ProfileApi | null>;

    /** Loading and error state for profile operations */
    isLoading: boolean;
    error: string | null;
}
