import { Controller, Post, Body, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from '../presenters/auth.dto';
import { User } from 'src/domain/entities/user.entity';
import { Module } from 'src/domain/entities/module.entity';
import { CURRENTUSER } from '../decorators/current.user.decorator';
import { JwtAuthGuard } from 'src/infrastructure/auth/jwt.auth.guard';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return await this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return await this.authService.login(loginDto);
    }

    @Post('logout')
    logout(): { message: string } {
        return { message: 'Logged out successfully' };
    }

    @Get('favorites')
    @UseGuards(JwtAuthGuard)
    async getFavorites(@CURRENTUSER() user: User): Promise<Module[]> {
        return await this.authService.getFavorites(user._id);
    }

    @Post('favorites/:moduleId')
    @UseGuards(JwtAuthGuard)
    async addFavorite(
        @CURRENTUSER() user: User,
        @Param('moduleId') moduleId: string,
    ): Promise<{ message: string }> {
        await this.authService.addFavorite(user._id, moduleId);
        return { message: 'Favorite added successfully' };
    }

    @Delete('favorites/:moduleId')
    @UseGuards(JwtAuthGuard)
    async removeFavorite(
        @CURRENTUSER() user: User,
        @Param('moduleId') moduleId: string,
    ): Promise<{ message: string }> {
        await this.authService.removeFavorite(user._id, moduleId);
        return { message: 'Favorite removed successfully' };
    }
}
