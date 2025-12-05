import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Repository } from 'typeorm';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    private subscriptionService: SubscriptionService,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const eixistingPlan = await this.planRepository.findOne({
      where: { name: createPlanDto.name },
    });

    if (eixistingPlan) throw new ConflictException('Plan already exists');

    const newPlan = this.planRepository.create(createPlanDto);
    return this.planRepository.save(newPlan);
  }

  async findAll(activeOnly = true): Promise<Plan[]> {
    const where = activeOnly ? { active: true } : {};
    return await this.planRepository.find({ where });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(
    id: string,
    updatePlanDto: UpdatePlanDto,
  ): Promise<Plan> {
    const plan = await this.findOne(id);
    Object.assign(plan, updatePlanDto);
    return this.planRepository.save(plan);
  }

  async remove(id: string) {
    const plan = await this.findOne(id);
    const activeSubs = await this.subscriptionService.countActiveSubscriptionsByPlan(id);

    if (activeSubs > 0) {
      throw new BadRequestException(
        'Cannot delete plan with active subscriptions',
      );
    }

    await this.planRepository.softRemove(plan);

    return { message: 'Plan removed successfully' };
  }
}
