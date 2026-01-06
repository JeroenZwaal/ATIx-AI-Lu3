import { Inject, Injectable } from '@nestjs/common';
import type { IModuleRepository } from '../../domain/repositories/module.repository.interface';
import { Module as DomainModule } from '../../domain/entities/module.entity';

@Injectable()
export class ModuleService {
  constructor(@Inject('IModuleRepository') private readonly repo: IModuleRepository) {}

  findAll(): Promise<DomainModule[]> {
    return this.repo.findAll();
  }

  findById(id: string): Promise<DomainModule | null> {
    return this.repo.findById(id);
  }

  findByExternalId(externalId: number): Promise<DomainModule | null> {
    return this.repo.findByExternalId(externalId);
  }

  search(query: string): Promise<DomainModule[]> {
    return this.repo.search(query);
  }

  count(): Promise<number> {
    return this.repo.count();
  }

  saveMany(modules: Omit<DomainModule, 'id'>[]): Promise<void> {
    return this.repo.saveMany(modules);
  }

  deleteAll(): Promise<void> {
    return this.repo.deleteAll();
  }
}
