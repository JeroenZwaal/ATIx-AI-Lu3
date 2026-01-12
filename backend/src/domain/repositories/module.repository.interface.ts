import { Module } from '../entities/module.entity';

export interface IModuleRepository {
    findAll(): Promise<Module[]>;
    findById(id: string): Promise<Module | null>;
    findByExternalId(externalId: number): Promise<Module | null>;
    search(query: string): Promise<Module[]>;
    count(): Promise<number>;
    deleteAll(): Promise<void>;
    getAllTags(): Promise<string[]>;
}

export const MODULE_REPOSITORY = Symbol('IModuleRepository');
