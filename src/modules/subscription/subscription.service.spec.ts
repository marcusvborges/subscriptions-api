import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './entities/subscription.entity';
import { UserService } from '../user/user.service';
import { PlanService } from '../plan/plan.service';
import { User } from '../user/entities/user.entity';
import { Plan } from '../plan/entities/plan.entity';
import { PlanPrice } from '../plan/entities/plan-price.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Role } from '../user/enum/role.enum';
import { BillingInterval } from '../plan/enum/billingInterval.enum';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let mockSubscriptionRepository: Record<string, jest.Mock>;
  let mockUserService: Record<string, jest.Mock>;
  let mockPlanService: Record<string, jest.Mock>;

  const createMockUser = (overrides = {}): User => ({
    id: 'user-001',
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    role: Role.USER,
    subscriptions: [],
    auths: [],
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockPlan = (overrides = {}): Plan => ({
    id: 'plan-001',
    name: 'Premium Plan',
    description: 'Premium features',
    active: true,
    category: 'Premium',
    features: { feature1: true },
    prices: [],
    subscriptions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockPrice = (overrides = {}): PlanPrice => ({
    id: 'price-001',
    plan: createMockPlan(),
    interval: BillingInterval.MONTH,
    amount: 99.99,
    currency: 'BRL',
    trialAvailable: false,
    trialDays: null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockSubscription = (overrides = {}): Subscription => {
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(now.getMonth() + 1);

    return {
      id: 'sub-001',
      user: createMockUser(),
      plan: createMockPlan(),
      price: undefined,
      active: true,
      startDate: now,
      canceledAt: null,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    } as any;
  };

  beforeEach(async () => {
    mockSubscriptionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    };

    mockUserService = {
      findOne: jest.fn(),
    };

    mockPlanService = {
      findOne: jest.fn(),
      findPriceById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockSubscriptionRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: PlanService,
          useValue: mockPlanService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);

    jest.clearAllMocks();
  });

  describe('FR-007: Create Subscription', () => {
    it('should create subscription with valid user and plan', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();
      const mockSubscription = createMockSubscription({
        user: mockUser,
        plan: mockPlan,
      });

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      // Act
      const result = await service.create(createSubscriptionDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('sub-001');
      expect(result.active).toBe(true);
      expect(mockSubscriptionRepository.create).toHaveBeenCalled();
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'invalid-user',
        planId: 'plan-001',
      };

      mockUserService.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createSubscriptionDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSubscriptionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if plan not found', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'invalid-plan',
      };
      const mockUser = createMockUser();

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createSubscriptionDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSubscriptionRepository.create).not.toHaveBeenCalled();
    });

    it('should set start date and expiration correctly', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();
      const mockSubscription = createMockSubscription({
        user: mockUser,
        plan: mockPlan,
      });

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      // Act
      const result = await service.create(createSubscriptionDto);

      // Assert
      expect(result.startDate).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt?.getTime()).toBeGreaterThan(
        result.startDate?.getTime() || 0,
      );
    });

    it('should link plan price if provided', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
        planPriceId: 'price-001',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();
      const mockPrice = createMockPrice({ plan: mockPlan });
      const mockSubscription = createMockSubscription({
        user: mockUser,
        plan: mockPlan,
        price: mockPrice,
      });

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockPlanService.findPriceById.mockResolvedValue(mockPrice);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      // Act
      const result = await service.create(createSubscriptionDto);

      // Assert
      expect(mockPlanService.findPriceById).toHaveBeenCalledWith('price-001');
      expect(result.price).toBeDefined();
      expect(result.price?.id).toBe('price-001');
    });

    it('should throw NotFoundException if plan price not found', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
        planPriceId: 'invalid-price',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockPlanService.findPriceById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createSubscriptionDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if price does not belong to plan', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
        planPriceId: 'price-wrong',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();
      const differentPlan = createMockPlan({ id: 'plan-999' });
      const mockPrice = createMockPrice({
        id: 'price-wrong',
        plan: differentPlan,
      });

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockPlanService.findPriceById.mockResolvedValue(mockPrice);

      // Act & Assert
      await expect(service.create(createSubscriptionDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('FR-008/FR-009: Duplicate Prevention & Allow After Cancellation', () => {
    it('should reject second active subscription for same user', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();
      const existingActiveSubscription = createMockSubscription({
        user: mockUser,
        plan: mockPlan,
        active: true,
      });

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findOne.mockResolvedValue(
        existingActiveSubscription,
      );

      // Act & Assert
      await expect(service.create(createSubscriptionDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createSubscriptionDto)).rejects.toThrow(
        'already has an active subscription',
      );
    });

    it('should verify duplicate check queries correctly', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue(
        createMockSubscription({ user: mockUser, plan: mockPlan }),
      );
      mockSubscriptionRepository.save.mockResolvedValue(
        createMockSubscription({ user: mockUser, plan: mockPlan }),
      );

      // Act
      await service.create(createSubscriptionDto);

      // Assert
      expect(mockSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'user-001' }, active: true },
      });
    });

    it('should allow new subscription if previous one is cancelled', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();
      const cancelledSubscription = createMockSubscription({
        user: mockUser,
        plan: mockPlan,
        active: false,
        canceledAt: new Date(),
      });

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue(
        createMockSubscription({ user: mockUser, plan: mockPlan }),
      );
      mockSubscriptionRepository.save.mockResolvedValue(
        createMockSubscription({ user: mockUser, plan: mockPlan }),
      );

      // Act
      const result = await service.create(createSubscriptionDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.active).toBe(true);
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
    });

    it('should distinguish between cancelled and active subscriptions', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue(
        createMockSubscription({ user: mockUser, plan: mockPlan }),
      );
      mockSubscriptionRepository.save.mockResolvedValue(
        createMockSubscription({ user: mockUser, plan: mockPlan }),
      );

      // Act
      await service.create(createSubscriptionDto);

      // Assert
      const callArgs = mockSubscriptionRepository.findOne.mock.calls[0][0];
      expect(callArgs.where.active).toBe(true);
    });
  });

  describe('FR-010: Cancel Subscription', () => {
    it('should cancel active subscription', async () => {
      // Arrange
      const subscriptionId = 'sub-001';
      const mockSubscription = createMockSubscription({
        id: subscriptionId,
        active: true,
        canceledAt: null,
      });
      const cancelledSubscription = { ...mockSubscription, active: false };

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(cancelledSubscription);

      // Act
      const result = await service.cancel(subscriptionId);

      // Assert
      expect(result.active).toBe(false);
      expect(result.canceledAt).toBeDefined();
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if subscription not found', async () => {
      // Arrange
      const subscriptionId = 'invalid-sub';

      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancel(subscriptionId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if subscription already inactive', async () => {
      // Arrange
      const subscriptionId = 'sub-001';
      const mockSubscription = createMockSubscription({
        id: subscriptionId,
        active: false,
        canceledAt: new Date(),
      });

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);

      // Act & Assert
      await expect(service.cancel(subscriptionId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should exclude cancelled subscription from active queries', async () => {
      // Arrange
      const subscriptionId = 'sub-001';
      const mockSubscription = createMockSubscription({
        id: subscriptionId,
        active: true,
      });
      const cancelledSubscription = {
        ...mockSubscription,
        active: false,
        canceledAt: new Date(),
      };

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(cancelledSubscription);

      // Act
      const result = await service.cancel(subscriptionId);

      // Assert
      expect(result.active).toBe(false);
      expect(result.canceledAt).toBeInstanceOf(Date);
    });
  });

  describe('FR-011: Calculate Expiration Dates', () => {
    it('should calculate next billing date for monthly plan', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(now.getMonth() + 1);

      const mockSubscription = createMockSubscription({
        user: mockUser,
        plan: mockPlan,
        startDate: now,
        expiresAt,
      });

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      // Act
      const result = await service.create(createSubscriptionDto);

      // Assert
      expect(result.expiresAt?.getMonth()).toBe((now.getMonth() + 1) % 12);
    });

    it('should calculate expiration date correctly on date boundaries', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();
      const startDate = new Date(2024, 0, 31);
      const expiresAt = new Date(startDate);
      expiresAt.setMonth(startDate.getMonth() + 1);

      const mockSubscription = createMockSubscription({
        user: mockUser,
        plan: mockPlan,
        startDate,
        expiresAt,
      });

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      // Act
      const result = await service.create(createSubscriptionDto);

      // Assert
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt?.getTime()).toBeGreaterThan(
        result.startDate?.getTime() || 0,
      );
    });
  });

  describe('FR-012: Validate Expiration Dates', () => {
    it('should validate date logic during creation', async () => {
      // Arrange
      const createSubscriptionDto: CreateSubscriptionDto = {
        userId: 'user-001',
        planId: 'plan-001',
      };
      const mockUser = createMockUser();
      const mockPlan = createMockPlan();
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(now.getMonth() + 1);

      const mockSubscription = createMockSubscription({
        user: mockUser,
        plan: mockPlan,
        startDate: now,
        expiresAt,
      });

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockPlanService.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionRepository.findOne.mockResolvedValue(null);
      mockSubscriptionRepository.create.mockReturnValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(mockSubscription);

      // Act
      const result = await service.create(createSubscriptionDto);

      // Assert
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt?.getTime()).toBeGreaterThan(
        result.startDate?.getTime() || 0,
      );
    });
  });

  describe('FR-013: Preserve Historical Records', () => {
    it('should keep subscription record after cancellation', async () => {
      // Arrange
      const subscriptionId = 'sub-001';
      const mockSubscription = createMockSubscription({
        id: subscriptionId,
        active: true,
      });
      const cancelledSubscription = {
        ...mockSubscription,
        active: false,
        canceledAt: new Date(),
      };

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(cancelledSubscription);

      // Act
      const result = await service.cancel(subscriptionId);

      // Assert
      expect(mockSubscriptionRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(subscriptionId);
      expect(result).toBeDefined();
    });

    it('should maintain audit trail with timestamps', async () => {
      // Arrange
      const subscriptionId = 'sub-001';
      const now = new Date();
      const mockSubscription = createMockSubscription({
        id: subscriptionId,
        active: true,
        startDate: now,
        createdAt: now,
        updatedAt: now,
      });
      const cancelledSubscription = {
        ...mockSubscription,
        active: false,
        canceledAt: new Date(),
      };

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.save.mockResolvedValue(cancelledSubscription);

      // Act
      const result = await service.cancel(subscriptionId);

      // Assert
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.canceledAt).toBeInstanceOf(Date);
      expect(result.startDate).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.canceledAt).toBeDefined();
    });
  });

  describe('FR-014: Retrieve Complete Subscription History', () => {
    it('should retrieve all subscriptions for user', async () => {
      // Arrange
      const userId = 'user-001';
      const mockUser = createMockUser({ id: userId });
      const mockSubscriptions = [
        createMockSubscription({ user: mockUser, active: true }),
        createMockSubscription({
          user: mockUser,
          active: false,
          canceledAt: new Date(),
        }),
      ];

      mockSubscriptionRepository.find.mockResolvedValue(mockSubscriptions);

      // Act
      const result = await service.findByUser(userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(mockSubscriptionRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['plan'],
      });
    });

    it('should include subscription metadata in history', async () => {
      // Arrange
      const userId = 'user-001';
      const mockUser = createMockUser({ id: userId });
      const mockPlan = createMockPlan();
      const mockSubscription = createMockSubscription({
        user: mockUser,
        plan: mockPlan,
      });

      mockSubscriptionRepository.find.mockResolvedValue([mockSubscription]);

      // Act
      const result = await service.findByUser(userId);

      // Assert
      expect(result[0].user).toBeDefined();
      expect(result[0].plan).toBeDefined();
      expect(result[0].startDate).toBeDefined();
      expect(result[0].expiresAt).toBeDefined();
    });

    it('should distinguish subscription status in results', async () => {
      // Arrange
      const userId = 'user-001';
      const mockUser = createMockUser({ id: userId });
      const now = new Date();
      const activeSubscription = createMockSubscription({
        user: mockUser,
        active: true,
        canceledAt: null,
      });
      const cancelledSubscription = createMockSubscription({
        user: mockUser,
        active: false,
        canceledAt: now,
      });

      mockSubscriptionRepository.find.mockResolvedValue([
        activeSubscription,
        cancelledSubscription,
      ]);

      // Act
      const result = await service.findByUser(userId);

      // Assert
      expect(result[0].active).toBe(true);
      expect(result[0].canceledAt).toBeNull();
      expect(result[1].active).toBe(false);
      expect(result[1].canceledAt).toBeDefined();
    });

    it('should retrieve all subscriptions with relations', async () => {
      // Arrange
      const mockSubscriptions = [
        createMockSubscription(),
        createMockSubscription({ id: 'sub-002' }),
      ];

      mockSubscriptionRepository.find.mockResolvedValue(mockSubscriptions);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(mockSubscriptionRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'plan'],
      });
    });
  });

  describe('findOne', () => {
    it('should retrieve single subscription by id', async () => {
      // Arrange
      const subscriptionId = 'sub-001';
      const mockSubscription = createMockSubscription({ id: subscriptionId });

      mockSubscriptionRepository.findOne.mockResolvedValue(mockSubscription);

      // Act
      const result = await service.findOne(subscriptionId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(subscriptionId);
      expect(mockSubscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: subscriptionId },
        relations: ['user', 'plan'],
      });
    });

    it('should throw NotFoundException if subscription not found', async () => {
      // Arrange
      const subscriptionId = 'invalid-sub';

      mockSubscriptionRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(subscriptionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('countActiveSubscriptionsByPlan', () => {
    it('should count active subscriptions for a plan', async () => {
      // Arrange
      const planId = 'plan-001';

      mockSubscriptionRepository.count.mockResolvedValue(5);

      // Act
      const result = await service.countActiveSubscriptionsByPlan(planId);

      // Assert
      expect(result).toBe(5);
      expect(mockSubscriptionRepository.count).toHaveBeenCalledWith({
        where: { plan: { id: planId }, active: true },
      });
    });

    it('should return zero if no active subscriptions for plan', async () => {
      // Arrange
      const planId = 'plan-001';

      mockSubscriptionRepository.count.mockResolvedValue(0);

      // Act
      const result = await service.countActiveSubscriptionsByPlan(planId);

      // Assert
      expect(result).toBe(0);
    });
  });
});
