import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { JwtPayload } from './jwt.strategy';
import { User } from '../../domain/entities/user.entity';

interface RequestWithUser {
    headers: {
        authorization?: string;
    };
    user?: User;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: RequestWithUser = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = this.authService.verifyToken(token);
            const user = await this.authService.validateUserById(payload.sub);

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            request.user = user;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }

    private extractTokenFromHeader(request: RequestWithUser): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) return undefined;

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}
