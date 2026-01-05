// Auth DTOs
export interface LoginDto {
  email: string;
  passwordHash: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
}

// Auth response
export interface AuthResponse {
  access_token: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

// User context type
export interface User {
  firstName: string;
  lastName: string;
  email: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}