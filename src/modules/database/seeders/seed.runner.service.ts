import { Injectable, Logger } from '@nestjs/common';

import { PlanSeederService } from './services/plan.seeder.service';
import { PlanPriceSeederService } from './services/plan-price.seeder.service';

@Injectable()
export class SeedRunnerService {
  private readonly logger = new Logger(SeedRunnerService.name);

  constructor(
    private readonly planSeeder: PlanSeederService,
    private readonly planPriceSeeder: PlanPriceSeederService,
  ) {}

  async run() {
    this.logger.log('🚀 Starting database seed...');

    await this.planSeeder.seed();

    await this.planPriceSeeder.seed();

    this.logger.log('✅ Database seed completed');
  }
}
