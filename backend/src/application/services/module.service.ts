import { Injectable, Inject } from '@nestjs/common';
import { Module } from '../../domain/entities/module.entity';
import type { IModuleRepository } from '../../domain/repositories/module.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserFavorite } from '../../domain/entities/user.entity';

@Injectable()
export class ModuleService {
    constructor(
        @Inject('IModuleRepository') private readonly moduleRepository: IModuleRepository,
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    ) {}

    async findAll(): Promise<Module[]> {
        return await this.moduleRepository.findAll();
    }

    async findById(id: string): Promise<Module | null> {
        return await this.moduleRepository.findById(id);
    }

    async search(query: string): Promise<Module[]> {
        return await this.moduleRepository.search(query);
    }

    async saveFavorite(userId: string, moduleId: string): Promise<void> {
        const module = await this.moduleRepository.findById(moduleId);
        if (!module) {
            throw new Error(`Module with ID ${moduleId} not found`);
        }
        const favorite = new UserFavorite(moduleId, new Date(), module.name);
        await this.userRepository.addFavorite(userId, favorite);
    }
    async removeFavorite(userId: string, moduleId: string): Promise<void> {
        await this.userRepository.removeFavorite(userId, moduleId);
    }
    async getFavorites(userId: string): Promise<Module[]> {
        return await this.userRepository.getFavorites(userId);
    }
}
