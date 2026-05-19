import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedRequest } from '../interfaces/authenticated-request';

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtPayload | undefined,
    context: ExecutionContext,
  ): JwtPayload | JwtPayload[keyof JwtPayload] => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!data) {
      return user;
    }

    return user[data];
  },
);
