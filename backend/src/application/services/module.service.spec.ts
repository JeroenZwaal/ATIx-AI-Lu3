/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleService } from './module.service';
import { IModuleRepository } from '../../domain/repositories/module.repository.interface';
import { Module } from '../../domain/entities/module.entity';

describe('ModuleService', () => {
    let service: ModuleService;
    let moduleRepository: IModuleRepository;

    const mockModule: Module = {
        id: '507f1f77bcf86cd799439011',
        externalId: 123,
        name: 'Test Module',
        shortdescription: 'Short description',
        description: 'Full description',
        content: 'Module content',
        studycredit: 5,
        location: 'Amsterdam',
        contactId: 1,
        level: 'NLQF5',
        learningoutcomes: 'Learning outcomes',
        tags: ['programming', 'web'],
        combinedText: 'Combined text',
    };

    const mockModuleRepository: jest.Mocked<IModuleRepository> = {
        findAll: jest.fn(),
        findById: jest.fn(),
        findByExternalId: jest.fn(),
        search: jest.fn(),
        count: jest.fn(),
        deleteAll: jest.fn(),
        getAllTags: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ModuleService,
                {
                    provide: 'IModuleRepository',
                    useValue: mockModuleRepository,
                },
            ],
        }).compile();

        service = module.get<ModuleService>(ModuleService);
        moduleRepository = module.get('IModuleRepository');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all modules', async () => {
            const modules = [mockModule];
            mockModuleRepository.findAll.mockResolvedValue(modules);

            const result = await service.findAll();

            expect(result).toEqual(modules);
            expect(mockModuleRepository.findAll).toHaveBeenCalledTimes(1);
        });

        it('should return empty array when no modules exist', async () => {
            mockModuleRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
            expect(mockModuleRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('findById', () => {
        it('should return module when found', async () => {
            mockModuleRepository.findById.mockResolvedValue(mockModule);

            const result = await service.findById('507f1f77bcf86cd799439011');

            expect(result).toEqual(mockModule);
            expect(mockModuleRepository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('should throw BadRequestException when invalid id provided', async () => {
            await expect(service.findById('nonexistent')).rejects.toThrow('Invalid module id');
        });

        it('should throw BadRequestException when module not found', async () => {
            mockModuleRepository.findById.mockResolvedValue(null);

            await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow(
                'Module with this ID doesnt exists',
            );
        });
    });

    describe('findByExternalId', () => {
        it('should return module when found by external ID', async () => {
            mockModuleRepository.findByExternalId.mockResolvedValue(mockModule);

            const result = await service.findByExternalId(123);

            expect(result).toEqual(mockModule);
            expect(mockModuleRepository.findByExternalId).toHaveBeenCalledWith(123);
        });

        it('should throw BadRequestException when module not found by external ID', async () => {
            mockModuleRepository.findByExternalId.mockResolvedValue(null);

            await expect(service.findByExternalId(999)).rejects.toThrow(
                'Module with this external ID doesnt exists',
            );
        });
    });

    describe('search', () => {
        it('should return matching modules for search query', async () => {
            const modules = [mockModule];
            mockModuleRepository.search.mockResolvedValue(modules);

            const result = await service.search('programming');

            expect(result).toEqual(modules);
            expect(mockModuleRepository.search).toHaveBeenCalledWith('programming');
        });

        it('should return empty array when no matches found', async () => {
            mockModuleRepository.search.mockResolvedValue([]);

            const result = await service.search('nonexistent');

            expect(result).toEqual([]);
            expect(mockModuleRepository.search).toHaveBeenCalledWith('nonexistent');
        });

        it('should throw BadRequestException for empty search query', async () => {
            await expect(service.search('')).rejects.toThrow('Invalid search query');
        });

        it('should throw BadRequestException for invalid search query', async () => {
            await expect(service.search(null as any)).rejects.toThrow('Invalid search query');
        });
    });

    describe('getAllTags', () => {
        it('should return all unique tags', async () => {
            const tags = ['programming', 'web', 'database'];
            mockModuleRepository.getAllTags.mockResolvedValue(tags);

            const result = await service.getAllTags();

            expect(result).toEqual(tags);
            expect(mockModuleRepository.getAllTags).toHaveBeenCalledTimes(1);
        });

        it('should return empty array when no tags exist', async () => {
            mockModuleRepository.getAllTags.mockResolvedValue([]);

            const result = await service.getAllTags();

            expect(result).toEqual([]);
            expect(mockModuleRepository.getAllTags).toHaveBeenCalledTimes(1);
        });
    });
});
