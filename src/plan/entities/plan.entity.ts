import { BaseEntity } from "src/modules/database/entities/base.entity";
import { Subscription } from "src/subscription/entities/subscription.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('plans')
export class Plan extends BaseEntity {
  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
  
  @OneToMany(() => Subscription, (sub) => sub.plan)
  subscriptions: Subscription[];
}
