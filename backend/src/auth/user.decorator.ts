import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/models/user.schema';

export const CurrentUser = createParamDecorator<unknown, ExecutionContext, User>(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);


