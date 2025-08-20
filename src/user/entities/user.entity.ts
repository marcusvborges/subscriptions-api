import { BaseEntity } from "src/modules/database/entities/base.entity";
import { Column, Entity } from "typeorm";
import { Role } from "../enum/role.enum";

@Entity('users')
export class User extends BaseEntity {
  @Column()
  fullName: string;

  @Column({unique: true})
  email: string;
  
  @Column()
  password: string;

  @Column({
    type:'enum',
    enum: Role,
    default: Role.USER
  })
  role: Role;

}
