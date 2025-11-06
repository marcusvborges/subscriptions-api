import { BaseEntity } from "src/modules/database/entities/base.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @Column()
  revoked: boolean;

  @ManyToOne(() => User, (user) => user.refreshTokens, {onDelete: 'CASCADE'})
  user: User;
}