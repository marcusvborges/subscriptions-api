import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Plan } from 'src/modules/plan/entities/plan.entity';
import { BaseEntity } from 'src/modules/database/entities/base.entity';
import { PlanPrice } from 'src/modules/plan/entities/plan-price.entity';

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @ManyToOne(() => User, (user) => user.subscriptions)
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  plan: Plan;

  @ManyToOne(() => PlanPrice, { eager: true, nullable: true })
  price?: PlanPrice;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  canceledAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date;
}