// src/common/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface UserPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext): UserPayload | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserPayload;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
