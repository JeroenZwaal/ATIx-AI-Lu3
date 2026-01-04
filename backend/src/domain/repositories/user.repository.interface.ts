import { CreateUserData, UpdateUserData, User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, userData: UpdateUserData): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
  enable2FA(id: string, secret: string): Promise<void>;
  disable2FA(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
