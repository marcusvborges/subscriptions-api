import { BaseEntity } from "src/modules/database/entities/base.entity";
import { Column } from "typeorm";

export class Plan extends BaseEntity {
  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
  
}
