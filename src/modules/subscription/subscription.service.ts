import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { PlanService } from '../plan/plan.service';
import { UserService } from '../user/user.service';
import { PlanPrice } from '../plan/entities/plan-price.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => PlanService))
    private readonly planService: PlanService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const user = await this.userService.findOne(createSubscriptionDto.userId);
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.planService.findOne(createSubscriptionDto.planId);
    if (!plan) throw new NotFoundException('Plan not found or inactive');

    let planPrice: PlanPrice | undefined;
    if (createSubscriptionDto.planPriceId) {
      planPrice = await this.planService.findPriceById(createSubscriptionDto.planPriceId);
      if (!planPrice) throw new NotFoundException('Plan price not found');
      if (planPrice.plan.id !== plan.id) {
        throw new BadRequestException('Plan price does not belong to the selected plan');
      }
    }

    const activeSubscription = await this.subscriptionRepository.findOne({
      where: { user: { id: createSubscriptionDto.userId }, active: true },
    });
    if (activeSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    const startDate = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(startDate.getMonth() + 1);

    const subscription = this.subscriptionRepository.create({
      user,
      plan,
      price: planPrice,
      active: true,
      startDate,
      expiresAt,
    });

    return await this.subscriptionRepository.save(subscription);
  }

  findAll() {
    return this.subscriptionRepository.find({
      relations: ['user', 'plan'],
    });
  }

  async findOne(id: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user', 'plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findByUser(userId: string) {
    return this.subscriptionRepository.find({
      where: { user: { id: userId } },
      relations: ['plan'],
    });
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');

    if (!subscription.active) {
      throw new BadRequestException('Subscription already inactive');
    }

    subscription.active = false;
    subscription.canceledAt = new Date();

    return await this.subscriptionRepository.save(subscription);
  }

  async countActiveSubscriptionsByPlan(planId: string): Promise<number> {
    return this.subscriptionRepository.count({
      where: { plan: { id: planId }, active: true },
    });
  }
}
