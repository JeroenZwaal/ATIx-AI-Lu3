export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  studentNumber?: string;
  studyProgram?: string;
  yearOfStudy?: number;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserData = Partial<
  Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'email'>
>;
