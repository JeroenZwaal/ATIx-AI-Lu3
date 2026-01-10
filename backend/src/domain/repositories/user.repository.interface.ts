import { UpdateUserDto } from 'src/interfaces/presenters/user.dto';
import { User, UserFavorite } from '../entities/user.entity';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(userData: User): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
    addFavorite(userId: string, favorite: UserFavorite): Promise<User>;
    removeFavorite(userId: string, moduleId: string): Promise<User>;
    updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
    enable2FA(id: string, secret: string): Promise<void>;
    disable2FA(id: string): Promise<void>;
    getFavorites(userId: string): Promise<UserFavorite[]>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
