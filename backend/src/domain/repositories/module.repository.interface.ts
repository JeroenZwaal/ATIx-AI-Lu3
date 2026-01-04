import { Module } from '../entities/module.entity';

export interface IModuleRepository {
  findAll(): Promise<Module[]>;
  findById(id: string): Promise<Module | null>;
  findByExternalId(externalId: number): Promise<Module | null>;
  search(query: string): Promise<Module[]>;
  count(): Promise<number>;
  saveMany(modules: Omit<Module, 'id'>[]): Promise<void>;
  deleteAll(): Promise<void>;
}

export const MODULE_REPOSITORY = Symbol('IModuleRepository');
