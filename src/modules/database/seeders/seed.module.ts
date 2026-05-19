import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from '../../plan/entities/plan.entity';
import { PlanPrice } from '../../plan/entities/plan-price.entity';
import { PlanSeederService } from './services/plan.seeder.service';
import { PlanPriceSeederService } from './services/plan-price.seeder.service';
import { SeedRunnerService } from './seed.runner.service';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, PlanPrice])],
  providers: [PlanSeederService, PlanPriceSeederService, SeedRunnerService],
  exports: [SeedRunnerService],
})
export class SeedModule {}
