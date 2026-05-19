import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../../../plan/entities/plan.entity';
import { PlanPrice } from '../../../plan/entities/plan-price.entity';
import { planPricesSeed } from '../data/plan-prices.data';

@Injectable()
export class PlanPriceSeederService {
  private readonly logger = new Logger(PlanPriceSeederService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,

    @InjectRepository(PlanPrice)
    private readonly planPriceRepository: Repository<PlanPrice>,
  ) {}

  async seed() {
    this.logger.log('🌱 Seeding plan prices...');

    for (const priceData of planPricesSeed) {
      const plan = await this.planRepository.findOne({
        where: {
          name: priceData.planName,
        },
      });

      if (!plan) {
        this.logger.warn(`Plan "${priceData.planName}" not found`);
        continue;
      }

      await this.planPriceRepository.upsert(
        {
          plan,
          interval: priceData.interval,
          amount: priceData.amount,
          currency: priceData.currency,
          trialAvailable: priceData.trialAvailable,
          trialDays: priceData.trialDays,
        },
        ['plan', 'interval'],
      );
    }

    this.logger.log('✔ Plan prices seeded');
  }
}
