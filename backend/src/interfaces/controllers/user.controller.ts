import {
    Controller,
    Post,
    Body,
    HttpStatus,
    HttpException,
    UseGuards,
    Get,
    Delete,
    Param,
    BadRequestException,
} from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { UpdateUserDto } from '../presenters/user.dto';
import { CURRENTUSER } from '../decorators/current.user.decorator';
import { User } from '../../domain/entities/user.entity';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.auth.guard';
import { Module } from '../../domain/entities/module.entity';
import { Types } from 'mongoose';

@Controller('api/user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    // @Post('test')
    // testEndpoint(@Body() body: any): Promise<{ message: string }> {
    //     return { message: 'Test endpoint is working!' };
    // }

    @UseGuards(JwtAuthGuard)
    @Post('updateProfile')
    async updateProfile(
        @CURRENTUSER() user: User,
        @Body() profileData: UpdateUserDto,
    ): Promise<{ message: string }> {
        try {
            await this.userService.updateProfile(user, profileData);
            return { message: 'Profile updated successfully' };
        } catch (error: unknown) {
            // console.error('Profile update error:', error);
            throw new HttpException(error as string, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('getProfile')
    async getProfile(@CURRENTUSER() user: User): Promise<UpdateUserDto> {
        try {
            const userProfile = await this.userService.getProfile(user);
            return userProfile;
        } catch (error: unknown) {
            console.error('Get profile error:', error);
            throw new HttpException(error as string, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('favorites')
    @UseGuards(JwtAuthGuard)
    async getFavorites(@CURRENTUSER() user: User): Promise<Module[]> {
        return await this.userService.getFavorites(user, user._id);
    }

    @Post('favorites/:moduleId')
    @UseGuards(JwtAuthGuard)
    async addFavorite(
        @CURRENTUSER() user: User,
        @Param('moduleId') moduleId: string,
    ): Promise<{ message: string }> {
        // Valideer moduleId om XSS en NoSQL injection te voorkomen
        if (!moduleId || typeof moduleId !== 'string' || !Types.ObjectId.isValid(moduleId)) {
            throw new BadRequestException('Invalid module ID');
        }
        await this.userService.addFavorite(user, user._id, moduleId);
        return { message: 'Favorite added successfully' };
    }

    @Delete('favorites/:moduleId')
    @UseGuards(JwtAuthGuard)
    async removeFavorite(
        @CURRENTUSER() user: User,
        @Param('moduleId') moduleId: string,
    ): Promise<{ message: string }> {
        // Valideer moduleId om XSS en NoSQL injection te voorkomen
        if (!moduleId || typeof moduleId !== 'string' || !Types.ObjectId.isValid(moduleId)) {
            throw new BadRequestException('Invalid module ID');
        }
        await this.userService.removeFavorite(user, user._id, moduleId);
        return { message: 'Favorite removed successfully' };
    }
}
