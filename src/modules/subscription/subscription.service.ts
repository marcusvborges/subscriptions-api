import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Plan } from '../plan/entities/plan.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.planRepository.findOne({
      where: { id: dto.planId, active: true },
    });
    if (!plan) throw new NotFoundException('Plan not found or inactive');

    const activeSubscription = await this.subscriptionRepository.findOne({
      where: { user: { id: dto.userId }, active: true },
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
      startDate,
      expiresAt,
      active: true,
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
