import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from '../presenters/auth.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt.auth.guard';

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
    @UseGuards(JwtAuthGuard)
    async logout(@Headers('authorization') authHeader: string): Promise<{ message: string }> {
        const token = authHeader?.replace('Bearer ', '');
        if (token) {
            await this.authService.invalidateToken(token);
        }
        return { message: 'Logged out successfully' };
    }
}
