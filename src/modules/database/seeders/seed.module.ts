import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from 'src/modules/plan/entities/plan.entity';
import { PlanPrice } from 'src/modules/plan/entities/plan-price.entity';
import { PlanSeederService } from './plan-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, PlanPrice])],
  providers: [PlanSeederService],
  exports: [PlanSeederService],
})
export class SeedModule {}
