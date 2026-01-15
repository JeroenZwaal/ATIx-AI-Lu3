import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../application/services/auth.service';
import { AuthController } from '../interfaces/controllers/auth.controller';
import { JwtStrategy } from '../infrastructure/auth/jwt.strategy';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { TokenBlacklistRepository } from '../infrastructure/repositories/token-blacklist.repository';
import { USERSCHEMA } from '../infrastructure/schemas/user.schema';
import { BLACKLISTED_TOKEN_SCHEMA } from '../infrastructure/schemas/blacklisted-token.schema';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
        MongooseModule.forFeature([
            { name: 'User', schema: USERSCHEMA },
            { name: 'BlacklistedToken', schema: BLACKLISTED_TOKEN_SCHEMA },
        ]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        {
            provide: 'IUserRepository',
            useClass: UserRepository,
        },
        {
            provide: 'ITokenBlacklistRepository',
            useClass: TokenBlacklistRepository,
        },
    ],
    exports: [
        AuthService,
        JwtStrategy,
        {
            provide: 'IUserRepository',
            useClass: UserRepository,
        },
        {
            provide: 'ITokenBlacklistRepository',
            useClass: TokenBlacklistRepository,
        },
    ],
})
export class AuthModule {}
