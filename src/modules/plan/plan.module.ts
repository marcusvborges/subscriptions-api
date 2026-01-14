import { forwardRef, Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlansController } from './plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PlanPrice } from './entities/plan-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      PlanPrice,
    ]),
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [PlansController],
  providers: [PlanService],
  exports: [PlanService],
})
export class PlansModule {}
