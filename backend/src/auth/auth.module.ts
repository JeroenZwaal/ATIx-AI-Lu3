import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../application/services/auth.service';
import { AuthController } from '../interfaces/controllers/auth.controller';
import { JwtStrategy } from '../infrastructure/auth/jwt.strategy';
import { RepositoryModule } from '../infrastructure/repositoy.module';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '24h' },
        }),
        RepositoryModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
