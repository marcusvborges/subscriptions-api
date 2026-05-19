import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../../../plan/entities/plan.entity';
import { plansSeed } from '../data/plans.data';

@Injectable()
export class PlanSeederService {
  private readonly logger = new Logger(PlanSeederService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async seed() {
    this.logger.log('🌱 Seeding plans...');
    const entities = plansSeed.map((plan) => this.planRepository.create(plan));

    await this.planRepository.upsert(entities, ['name']);

    this.logger.log(`✔ ${plansSeed.length} plans seeded`);
  }
}
