import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';

export interface JwtPayload {
    email: string;
    sub: string;
}

@Injectable()
export class JwtStrategy {
    constructor(private readonly authService: AuthService) {}

    async validate(payload: JwtPayload) {
        const user = await this.authService.validateUserById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
