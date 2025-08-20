import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Plan } from 'src/modules/plan/entities/plan.entity';
import { BaseEntity } from 'src/modules/database/entities/base.entity';

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @ManyToOne(() => User, (user) => user.subscriptions)
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  plan: Plan;
}