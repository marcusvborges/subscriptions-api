import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Role } from "../enum/role.enum";

export class ResponseUserDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  role: Role
}