/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleController } from './module.controller';
import { ModuleService } from '../../application/services/module.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.auth.guard';
import { Module } from '../../domain/entities/module.entity';

describe('ModuleController', () => {
    let controller: ModuleController;
    let moduleService: ModuleService;

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

    const mockModuleService = {
        findAll: jest.fn(),
        findById: jest.fn(),
        findByExternalId: jest.fn(),
        search: jest.fn(),
        getAllTags: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ModuleController],
            providers: [
                {
                    provide: ModuleService,
                    useValue: mockModuleService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<ModuleController>(ModuleController);
        moduleService = module.get<ModuleService>(ModuleService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all modules', async () => {
            const modules = [mockModule];
            mockModuleService.findAll.mockResolvedValue(modules);

            const result = await controller.findAll();

            expect(result).toEqual(modules);
            expect(moduleService.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return module by id', async () => {
            mockModuleService.findById.mockResolvedValue(mockModule);

            const result = await controller.findById('507f1f77bcf86cd799439011');

            expect(result).toEqual(mockModule);
            expect(moduleService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('should throw BadRequestException when invalid id provided', async () => {
            await expect(controller.findById('nonexistent')).rejects.toThrow('Invalid module ID');
        });

        it('should return null when module not found', async () => {
            mockModuleService.findById.mockResolvedValue(null);

            const result = await controller.findById('507f1f77bcf86cd799439011');

            expect(result).toBeNull();
        });
    });

    describe('findByExternalId', () => {
        it('should return module by external id', async () => {
            mockModuleService.findByExternalId.mockResolvedValue(mockModule);

            const result = await controller.findByExternalId('123');

            expect(result).toEqual(mockModule);
            expect(moduleService.findByExternalId).toHaveBeenCalledWith(123);
        });

        it('should return null when module not found', async () => {
            mockModuleService.findByExternalId.mockResolvedValue(null);

            const result = await controller.findByExternalId('999');

            expect(result).toBeNull();
        });
    });

    describe('search', () => {
        it('should search modules by query', async () => {
            const modules = [mockModule];
            mockModuleService.search.mockResolvedValue(modules);

            const result = await controller.search('programming');

            expect(result).toEqual(modules);
            expect(moduleService.search).toHaveBeenCalledWith('programming');
        });

        it('should return all modules when no query provided', async () => {
            const modules = [mockModule];
            mockModuleService.findAll.mockResolvedValue(modules);

            const result = await controller.search('');

            expect(result).toEqual(modules);
            expect(moduleService.findAll).toHaveBeenCalled();
        });

        it('should return all modules when query is undefined', async () => {
            const modules = [mockModule];
            mockModuleService.findAll.mockResolvedValue(modules);

            const result = await controller.search(undefined as unknown as string);

            expect(result).toEqual(modules);
            expect(moduleService.findAll).toHaveBeenCalled();
        });
    });

    describe('getAllTags', () => {
        it('should return all tags', async () => {
            const tags = ['programming', 'web', 'database'];
            mockModuleService.getAllTags.mockResolvedValue(tags);

            const result = await controller.getAllTags();

            expect(result).toEqual(tags);
            expect(moduleService.getAllTags).toHaveBeenCalled();
        });
    });
});
