import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../application/services/auth.service';
import { AuthController } from '../interfaces/controllers/auth.controller';
import { JwtStrategy } from '../infrastructure/auth/jwt.strategy';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { USERSCHEMA } from '../infrastructure/schemas/user.schema';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '24h' },
        }),
        MongooseModule.forFeature([{ name: 'User', schema: USERSCHEMA }]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        {
            provide: 'IUserRepository',
            useClass: UserRepository,
        },
    ],
    exports: [
        AuthService,
        JwtStrategy,
        {
            provide: 'IUserRepository',
            useClass: UserRepository,
        },
    ],
})
export class AuthModule {}
