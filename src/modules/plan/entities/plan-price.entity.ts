import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { Plan } from './plan.entity';
import { BillingInterval } from '../enum/billingInterval.enum';

@Entity('plan_prices')
export class PlanPrice extends BaseEntity {
  @ManyToOne(() => Plan, (plan) => plan.prices, { onDelete: 'CASCADE' })
  plan!: Plan;

  @Column({
    type: 'enum',
    enum: BillingInterval,
    default: 'month',
  })
  interval!: BillingInterval;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ default: 'BRL' })
  currency!: string;

  @Column({ default: false })
  trialAvailable!: boolean;

  @Column({ type: 'int', nullable: true })
  trialDays?: number;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;
}
