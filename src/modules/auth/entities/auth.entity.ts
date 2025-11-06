import { BaseEntity } from "src/modules/database/entities/base.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('auths')
export class Auth extends BaseEntity {
  @ManyToOne(() => User, (user) => user.auths, { eager: true })
  @JoinColumn()
  user: User;
}
