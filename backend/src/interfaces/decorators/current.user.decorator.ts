import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/domain/entities/user.entity';

interface RequestWithUser extends Request {
    user?: User;
}

export const CURRENTUSER = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): User | null => {
        const request = ctx.switchToHttp().getRequest<RequestWithUser>();
        return request.user || null;
    },
);
