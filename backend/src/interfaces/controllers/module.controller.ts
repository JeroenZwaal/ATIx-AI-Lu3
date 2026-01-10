import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ModuleService } from '../../application/services/module.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.auth.guard';
import { get } from 'mongoose';

@Controller('api/modules')
@UseGuards(JwtAuthGuard)
export class ModuleController {
    constructor(private readonly moduleService: ModuleService) {}

    @Get('search')
    async search(@Query('q') query: string) {
        if (!query) {
            return await this.moduleService.findAll();
        }
        return await this.moduleService.search(query);
    }

    @Get('getAllTags')
    async getAllTags() {
        return await this.moduleService.getAllTags();
    }

    @Get()
    async findAll() {
        return await this.moduleService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return await this.moduleService.findById(id);
    }
}
