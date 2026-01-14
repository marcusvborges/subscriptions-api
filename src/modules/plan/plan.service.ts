import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { PlanPrice } from './entities/plan-price.entity';
import { Repository } from 'typeorm';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(PlanPrice)
    private readonly planPriceRepository: Repository<PlanPrice>,
    private readonly subscriptionService: SubscriptionService,
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
    const qb = this.planRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.prices', 'price');
    
    if (activeOnly) qb.where('plan.active = :active', { active: true });
    return await qb.getMany();
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id }, relations: ['prices'] });
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

  async createPrice(
    planId: string,
    createPriceDto: CreatePriceDto,
  ): Promise<PlanPrice> {
    const plan = await this.findOne(planId);
    const newPrice = this.planPriceRepository.create({
      ...createPriceDto,
      amount: createPriceDto.amount,
      currency: createPriceDto.currency || 'BRL',
      plan,
    });
    return this.planPriceRepository.save(newPrice);
  }

  async findPricesByPlan(planId: string): Promise<PlanPrice[]> {
    return await this.planPriceRepository.find({
      where: { plan: { id: planId } },
      relations: ['plan'],
    });
  }

  async findPriceById(priceId: string): Promise<PlanPrice> {
    const price = await this.planPriceRepository.findOne({
      where: { id: priceId }, relations: ['plan'],
    });
    if (!price) throw new NotFoundException('Plan price not found');
    return price;
  }

  async updatePrice(
    priceId: string,
    updatePriceDto: UpdatePriceDto,
  ): Promise<PlanPrice> {
    const price = await this.planPriceRepository.findOne({
      where: { id: priceId },
      relations: ['plan'],
    });
    if (!price) throw new NotFoundException('Price not found');

    Object.assign(price, updatePriceDto);
    return this.planPriceRepository.save(price);
  }


  async removePrice(priceId: string) {
    const price = await this.planPriceRepository.findOne({
      where: { id: priceId },
      relations: ['plan'],
    });
    if (!price) throw new NotFoundException('Price not found');

    await this.planPriceRepository.softRemove(price);
    return { message: 'Price removed successfully' };
  }
}
