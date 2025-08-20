import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlansController } from './plan.controller';

@Module({
  controllers: [PlansController],
  providers: [PlanService],
})
export class PlansModule {}
