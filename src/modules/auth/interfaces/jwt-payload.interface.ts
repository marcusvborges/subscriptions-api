import { Role } from '../../user/enum/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
