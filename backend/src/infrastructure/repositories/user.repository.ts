import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserFavorite } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
    ) {}

    async findById(id: string): Promise<User | null> {
        // Validate and sanitize ID to prevent NoSQL injection
        if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
            return null;
        }
        const userDoc = await this.userModel.findById(new Types.ObjectId(id));
        return userDoc ? this.mapToEntity(userDoc) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        // Validate and sanitize email to prevent NoSQL injection
        if (!email || typeof email !== 'string') {
            return null;
        }
        const userDoc = await this.userModel.findOne({ email: { $eq: email.toString() } });
        return userDoc ? this.mapToEntity(userDoc) : null;
    }

    async findAll(): Promise<User[]> {
        try {
        console.log('UserRepository.findAll() called');
        const userDocs = await this.userModel.find();
        console.log(`Found ${userDocs.length} users in database`);
        
        const users = userDocs.map(doc => {
            console.log('Mapping user document:', doc._id);
            return this.mapToEntity(doc);
        });
        
        console.log('Successfully mapped all users');
        return users;
        } catch (error) {
        console.error('Error in UserRepository.findAll():', error);
        throw error;
        }
    }

    async create(user: User): Promise<User> {
        const userDoc = new this.userModel({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        passwordHash: user.passwordHash,
        favorites: user.favorites.map(fav => ({
            module_id: fav.moduleId,
            added_at: fav.addedAt,
            module_name: fav.moduleName,
        })),
        skills: user.skills,
        interests: user.interests,
        twoFactorEnabled: user.twoFactorEnabled,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        studentNumber: user.studentNumber,
        studyProgram: user.studyProgram,
        yearOfStudy: user.yearOfStudy,
        twoFactorSecret: user.twoFactorSecret,
        refreshToken: user.refreshToken,
        });
        
        const savedDoc = await userDoc.save();
        return this.mapToEntity(savedDoc);
    }

    async update(id: string, userData: Partial<User>): Promise<User | null> {
        throw new Error('Method not implemented.');
    }

    async delete(id: string): Promise<boolean> {
        // Validate and sanitize ID to prevent NoSQL injection
        if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
            return false;
        }
        const result = await this.userModel.findByIdAndDelete(new Types.ObjectId(id));
        return !!result;
    }

    async addFavorite(userId: string, favorite: UserFavorite): Promise<User> {
        // Validate and sanitize userId to prevent NoSQL injection
        if (!userId || typeof userId !== 'string' || !Types.ObjectId.isValid(userId)) {
            throw new Error(`Invalid user ID: ${userId}`);
        }
        const user = await this.userModel.findById(new Types.ObjectId(userId));
        if (!user) {
        throw new Error(`User with ID ${userId} not found`);
        }
        user.favorites.push({
            module_id: favorite.moduleId,
            added_at: favorite.addedAt,
            module_name: favorite.moduleName,
        });
        const updatedUser = await user.save();
        return this.mapToEntity(updatedUser);
    }

    async removeFavorite(userId: string, moduleId: string): Promise<User> {
        // Validate and sanitize userId to prevent NoSQL injection
        if (!userId || typeof userId !== 'string' || !Types.ObjectId.isValid(userId)) {
            throw new Error(`Invalid user ID: ${userId}`);
        }
        // Validate and sanitize moduleId
        if (!moduleId || typeof moduleId !== 'string') {
            throw new Error(`Invalid module ID: ${moduleId}`);
        }
        const user = await this.userModel.findById(new Types.ObjectId(userId));
        if (!user) {
        throw new Error(`User with ID ${userId} not found`);
        }
        user.favorites = user.favorites.filter(fav => fav.module_id !== moduleId);
        const updatedUser = await user.save();
        return this.mapToEntity(updatedUser);
    }

    updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
        throw new Error('Method not implemented.');
    }

    enable2FA(id: string, secret: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    disable2FA(id: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private mapToEntity(userDoc: UserDocument): User {
        try {
        console.log('Mapping user document to entity, _id:', userDoc._id);
        console.log('UserDoc keys:', Object.keys(userDoc));
        
        const favorites = userDoc.favorites?.map(fav => 
            new UserFavorite(
            fav.module_id,
            fav.added_at,
            fav.module_name,
            )
        ) || [];

        let id: string;
        if (userDoc._id) {
            id = userDoc._id.toString();
        } else {
            id = Math.random().toString(36).substr(2, 9);
            console.warn('No _id found for user document, generating temporary ID:', id);
        }
        
        console.log('Using ID:', id);

        const user = new User(
            id,
            userDoc.email,
            userDoc.passwordHash,
            userDoc.firstName,
            userDoc.lastName,
            userDoc.skills,
            userDoc.interests,
            favorites,
            userDoc.twoFactorEnabled,
            userDoc.created_at,
            userDoc.updated_at,
            userDoc.phoneNumber,
            userDoc.bio,
            userDoc.studentNumber,
            userDoc.studyProgram,
            userDoc.yearOfStudy,
            userDoc.twoFactorSecret,
            userDoc.refreshToken,
        );
        
        console.log('Successfully created User entity');
        return user;
        } catch (error) {
        console.error('Error in mapToEntity:', error);
        console.error('UserDoc:', userDoc);
        throw error;
        }
    }
}