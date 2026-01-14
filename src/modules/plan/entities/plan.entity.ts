import { BaseEntity } from "src/modules/database/entities/base.entity";
import { Subscription } from "src/modules/subscription/entities/subscription.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { PlanPrice } from "./plan-price.entity";

@Entity('plans')
export class Plan extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  category?: string;

  @Column('jsonb', { nullable: true })
  features?: Record<string, any>;

  @OneToMany(() => PlanPrice, (price) => price.plan, { cascade: true })
  prices: PlanPrice[];

  @OneToMany(() => Subscription, (sub) => sub.plan)
  subscriptions: Subscription[];
}
