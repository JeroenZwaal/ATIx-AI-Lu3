import { Controller, Get, Param, Query, UseGuards, Post, Delete } from '@nestjs/common';
import { ModuleService } from '../../application/services/module.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.auth.guard';
import { CURRENTUSER } from '../decorators/current.user.decorator';
import { User } from '../../domain/entities/user.entity';

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

    @Get()
    async findAll() {
        return await this.moduleService.findAll();
    }

    @Get('favorites')
    async getFavorites(@CURRENTUSER() user: User) {
        if (!user) {
            throw new Error('User not found');
        }
        return await this.moduleService.getFavorites(user._id);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return await this.moduleService.findById(id);
    }

    @Post('favorite/:moduleId')
    async saveFavorite(@Param('moduleId') moduleId: string, @CURRENTUSER() user: User) {
        if (!user) {
            throw new Error('User not found');
        }
        return await this.moduleService.saveFavorite(user._id, moduleId);
    }

    @Delete('favorite/:moduleId')
    async removeFavorite(@Param('moduleId') moduleId: string, @CURRENTUSER() user: User) {
        if (!user) {
            throw new Error('User not found');
        }
        return await this.moduleService.removeFavorite(user._id, moduleId);
    }
}
