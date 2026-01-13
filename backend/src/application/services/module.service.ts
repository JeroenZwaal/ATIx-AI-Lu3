import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Module } from '../../domain/entities/module.entity';
import type { IModuleRepository } from '../../domain/repositories/module.repository.interface';

@Injectable()
export class ModuleService {
    constructor(
        @Inject('IModuleRepository') private readonly moduleRepository: IModuleRepository,
    ) {}

    async findAll(): Promise<Module[]> {
        return await this.moduleRepository.findAll();
    }

    async findById(id: string): Promise<Module | null> {
        return await this.moduleRepository.findById(id);
    }

    async findByExternalId(externalId: number): Promise<Module | null> {
        return await this.moduleRepository.findByExternalId(externalId);
    }

    async search(query: string): Promise<Module[]> {
        return await this.moduleRepository.search(query);
    }

    async getAllTags(): Promise<string[]> {
        return await this.moduleRepository.getAllTags();
    }
}
