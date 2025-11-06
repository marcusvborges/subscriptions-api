import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext): JwtPayload => {
    const req = context.switchToHttp().getRequest();
    if (!data) return req.user;
    return req.user?.[data];
  },
)