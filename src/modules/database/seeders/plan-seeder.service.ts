import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from 'src/modules/plan/entities/plan.entity';
import { PlanPrice } from 'src/modules/plan/entities/plan-price.entity';

@Injectable()
export class PlanSeederService {
  private readonly logger = new Logger(PlanSeederService.name);

  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,

    @InjectRepository(PlanPrice)
    private readonly priceRepository: Repository<PlanPrice>,
  ) {}

  async seed() {
    const count = await this.planRepository.count();
    if (count > 0) {
      this.logger.log('Plans already exist — skipping seed.');
      return;
    }

    const basic = this.planRepository.create({ name: 'Basic', active: true, description: 'Basic plan', features: { seats: 1 } });
    const pro = this.planRepository.create({ name: 'Pro', active: true, description: 'Pro plan', features: { seats: 5 } });
    const premium = this.planRepository.create({ name: 'Premium', active: true, description: 'Premium plan', features: { seats: 10 } });

    await this.planRepository.save([basic, pro, premium]);

    const prices: Partial<PlanPrice>[] = [
      { plan: basic, interval: 'month', amount: 19.9, currency: 'BRL', trialAvailable: false },
      { plan: pro, interval: 'month', amount: 49.9, currency: 'BRL', trialAvailable: true, trialDays: 7 },
      { plan: premium, interval: 'month', amount: 99.9, currency: 'BRL', trialAvailable: true, trialDays: 14 },

      { plan: basic, interval: 'year', amount: 199.9, currency: 'BRL', trialAvailable: false },
      { plan: pro, interval: 'year', amount: 499.9, currency: 'BRL', trialAvailable: true, trialDays: 7 },
      { plan: premium, interval: 'year', amount: 999.9, currency: 'BRL', trialAvailable: true, trialDays: 14 },
    ];

    const priceEntities = this.priceRepository.create(prices);
    await this.priceRepository.save(priceEntities);

    this.logger.log('✔ Default plans and prices seeded successfully!');
  }
}
