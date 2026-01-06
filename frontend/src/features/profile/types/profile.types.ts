export interface CreateProfileDto {
    opleiding: string;
    leerjaar: string;
    studielocatie: string;
    studiepunten: string;
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

export interface ProfileContextType{
  // user: User | null;
  // token: string | null;
  createProfile: (createProfileData: CreateProfileDto) => Promise<UpdateProfileResponse>;
  // login: (email: string, password: string) => Promise<void>;
  // register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  // logout: () => Promise<void>;
  // isLoading: boolean;
  // error: string | null;
}