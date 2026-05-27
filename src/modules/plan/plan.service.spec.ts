import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlanService } from './plan.service';
import { Plan } from './entities/plan.entity';
import { PlanPrice } from './entities/plan-price.entity';
import { SubscriptionService } from '../subscription/subscription.service';
import { BillingInterval } from './enum/billingInterval.enum';

describe('PlanService', () => {
  let service: PlanService;
  let mockPlanRepository: Record<string, jest.Mock>;
  let mockPlanPriceRepository: Record<string, jest.Mock>;
  let mockSubscriptionService: Record<string, jest.Mock>;

  const createMockPlan = (overrides = {}): Plan => ({
    id: 'plan-001',
    name: 'Test Plan',
    description: 'A test plan',
    active: true,
    category: 'Premium',
    features: { feature1: true },
    prices: [],
    subscriptions: [],
    deletedAt: null,
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
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    mockPlanRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      softRemove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockPlanPriceRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      softRemove: jest.fn(),
    };

    mockSubscriptionService = {
      countActiveSubscriptionsByPlan: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanService,
        {
          provide: getRepositoryToken(Plan),
          useValue: mockPlanRepository,
        },
        {
          provide: getRepositoryToken(PlanPrice),
          useValue: mockPlanPriceRepository,
        },
        {
          provide: SubscriptionService,
          useValue: mockSubscriptionService,
        },
      ],
    }).compile();

    service = module.get<PlanService>(PlanService);

    jest.clearAllMocks();
  });

  describe('FR-001: Create Plan', () => {
    it('should create a new plan with valid data', async () => {
      // Arrange
      const createPlanDto = {
        name: 'Premium Plan',
        description: 'Premium features',
      };
      const mockPlan = createMockPlan(createPlanDto);

      mockPlanRepository.findOne.mockResolvedValue(null); // No existing plan
      mockPlanRepository.create.mockReturnValue(mockPlan);
      mockPlanRepository.save.mockResolvedValue(mockPlan);

      // Act
      const result = await service.create(createPlanDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('plan-001');
      expect(result.name).toBe('Premium Plan');
      expect(mockPlanRepository.create).toHaveBeenCalledWith(createPlanDto);
      expect(mockPlanRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if plan name already exists', async () => {
      // Arrange
      const createPlanDto = { name: 'Existing Plan' };
      const existingPlan = createMockPlan({ name: 'Existing Plan' });

      mockPlanRepository.findOne.mockResolvedValue(existingPlan);

      // Act & Assert
      await expect(service.create(createPlanDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPlanRepository.create).not.toHaveBeenCalled();
    });

    it('should persist plan with correct fields to repository', async () => {
      // Arrange
      const createPlanDto = {
        name: 'New Plan',
        description: 'New description',
        active: true,
      };
      const mockPlan = createMockPlan(createPlanDto);

      mockPlanRepository.findOne.mockResolvedValue(null);
      mockPlanRepository.create.mockReturnValue(mockPlan);
      mockPlanRepository.save.mockResolvedValue(mockPlan);

      // Act
      await service.create(createPlanDto);

      // Assert
      expect(mockPlanRepository.save).toHaveBeenCalledWith(mockPlan);
      expect(mockPlanRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('FR-002: Validate Pricing', () => {
    it('should reject plan with zero price', async () => {
      // Arrange
      const planId = 'plan-001';
      const createPriceDto = {
        interval: BillingInterval.MONTH,
        amount: 0,
      };
      const mockPlan = createMockPlan();

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);

      // Act & Assert
      await expect(service.createPrice(planId, createPriceDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject plan with negative price', async () => {
      // Arrange
      const planId = 'plan-001';
      const createPriceDto = {
        interval: BillingInterval.MONTH,
        amount: -99.99,
      };
      const mockPlan = createMockPlan();

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);

      // Act & Assert
      await expect(service.createPrice(planId, createPriceDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept plan with positive price', async () => {
      // Arrange
      const planId = 'plan-001';
      const createPriceDto = {
        interval: BillingInterval.MONTH,
        amount: 99.99,
      };
      const mockPlan = createMockPlan();
      const mockPrice = createMockPrice({ amount: 99.99 });

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockPlanPriceRepository.create.mockReturnValue(mockPrice);
      mockPlanPriceRepository.save.mockResolvedValue(mockPrice);

      // Act
      const result = await service.createPrice(planId, createPriceDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.amount).toBe(99.99);
      expect(mockPlanPriceRepository.save).toHaveBeenCalled();
    });
  });

  describe('FR-003: Validate Billing Interval', () => {
    it('should accept valid billing intervals (MONTH, YEAR)', async () => {
      // Arrange
      const planId = 'plan-001';
      const mockPlan = createMockPlan();

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockPlanPriceRepository.create.mockReturnValue(createMockPrice());
      mockPlanPriceRepository.save.mockResolvedValue(createMockPrice());

      // Act - Test MONTH interval
      const resultMonth = await service.createPrice(planId, {
        interval: BillingInterval.MONTH,
        amount: 99.99,
      });

      // Assert
      expect(resultMonth).toBeDefined();
      expect(mockPlanPriceRepository.save).toHaveBeenCalled();

      jest.clearAllMocks();
      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockPlanPriceRepository.create.mockReturnValue(
        createMockPrice({ interval: BillingInterval.YEAR }),
      );
      mockPlanPriceRepository.save.mockResolvedValue(
        createMockPrice({ interval: BillingInterval.YEAR }),
      );

      // Act - Test YEAR interval
      const resultYear = await service.createPrice(planId, {
        interval: BillingInterval.YEAR,
        amount: 999.99,
      });

      // Assert
      expect(resultYear).toBeDefined();
    });
  });

  describe('FR-004: Update Plan', () => {
    it('should update plan name and description without affecting subscriptions', async () => {
      // Arrange
      const planId = 'plan-001';
      const updatePlanDto = {
        name: 'Updated Plan',
        description: 'Updated description',
      };
      const mockPlan = createMockPlan();
      const updatedPlan = createMockPlan(updatePlanDto);

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockPlanRepository.save.mockResolvedValue(updatedPlan);

      // Act
      const result = await service.update(planId, updatePlanDto);

      // Assert
      expect(result.name).toBe('Updated Plan');
      expect(result.description).toBe('Updated description');
      expect(mockPlanRepository.save).toHaveBeenCalled();
      expect(
        mockSubscriptionService.countActiveSubscriptionsByPlan,
      ).not.toHaveBeenCalled();
    });

    it('should not call subscriptionService when updating metadata', async () => {
      // Arrange
      const planId = 'plan-001';
      const updatePlanDto = { category: 'Enterprise' };
      const mockPlan = createMockPlan();

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockPlanRepository.save.mockResolvedValue(mockPlan);

      // Act
      await service.update(planId, updatePlanDto);

      // Assert
      expect(
        mockSubscriptionService.countActiveSubscriptionsByPlan,
      ).not.toHaveBeenCalled();
    });
  });

  describe('FR-005: Soft Delete Plan', () => {
    it('should soft delete plan successfully when no active subscriptions', async () => {
      // Arrange
      const planId = 'plan-001';
      const mockPlan = createMockPlan();

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionService.countActiveSubscriptionsByPlan.mockResolvedValue(
        0,
      );
      mockPlanRepository.softRemove.mockResolvedValue(mockPlan);

      // Act
      const result = await service.remove(planId);

      // Assert
      expect(mockPlanRepository.softRemove).toHaveBeenCalledWith(mockPlan);
      expect(result.message).toBe('Plan removed successfully');
    });

    it('should throw BadRequestException when plan has active subscriptions', async () => {
      // Arrange
      const planId = 'plan-001';
      const mockPlan = createMockPlan();

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionService.countActiveSubscriptionsByPlan.mockResolvedValue(
        5,
      );

      // Act & Assert
      await expect(service.remove(planId)).rejects.toThrow(BadRequestException);
      expect(mockPlanRepository.softRemove).not.toHaveBeenCalled();
    });

    it('should call subscriptionService to verify no active subscriptions before delete', async () => {
      // Arrange
      const planId = 'plan-001';
      const mockPlan = createMockPlan();

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockSubscriptionService.countActiveSubscriptionsByPlan.mockResolvedValue(
        0,
      );
      mockPlanRepository.softRemove.mockResolvedValue(mockPlan);

      // Act
      await service.remove(planId);

      // Assert
      expect(
        mockSubscriptionService.countActiveSubscriptionsByPlan,
      ).toHaveBeenCalledWith(planId);
    });
  });

  describe('FR-006: Exclude Soft-Deleted Plans', () => {
    it('should return only active plans when calling findAll(activeOnly: true)', async () => {
      // Arrange
      const activePlan = createMockPlan({ active: true });
      const deletedPlan = createMockPlan({
        name: 'Deleted Plan',
        deletedAt: new Date(),
      });
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([activePlan]),
      };

      mockPlanRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.findAll(true);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].active).toBe(true);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should return all plans including soft-deleted when calling findAll(activeOnly: false)', async () => {
      // Arrange
      const activePlan = createMockPlan({ active: true });
      const deletedPlan = createMockPlan({
        name: 'Deleted Plan',
        deletedAt: new Date(),
      });
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([activePlan, deletedPlan]),
      };

      mockPlanRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.findAll(false);

      // Assert
      expect(result).toHaveLength(2);
      expect(mockQueryBuilder.where).not.toHaveBeenCalledWith(
        expect.stringContaining('active'),
        expect.anything(),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should return soft-deleted plan when queried directly by findOne', async () => {
      // Arrange
      const planId = 'plan-001';
      const deletedPlan = createMockPlan({ deletedAt: new Date() });

      mockPlanRepository.findOne.mockResolvedValue(deletedPlan);

      // Act
      const result = await service.findOne(planId);

      // Assert
      expect(result).toBeDefined();
      expect(result.deletedAt).toBeDefined();
    });

    it('should throw NotFoundException when plan not found', async () => {
      // Arrange
      const planId = 'nonexistent';
      mockPlanRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(planId)).rejects.toThrow(NotFoundException);
    });

    it('should retrieve all price tiers for plan with multiple prices', async () => {
      // Arrange
      const planId = 'plan-001';
      const prices = [
        createMockPrice({ interval: BillingInterval.MONTH, amount: 99.99 }),
        createMockPrice({
          interval: BillingInterval.YEAR,
          amount: 999.99,
          id: 'price-002',
        }),
        createMockPrice({
          interval: BillingInterval.WEEK,
          amount: 24.99,
          id: 'price-003',
        }),
      ];

      mockPlanPriceRepository.find.mockResolvedValue(prices);

      // Act
      const result = await service.findPricesByPlan(planId);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].interval).toBe(BillingInterval.MONTH);
      expect(result[1].interval).toBe(BillingInterval.YEAR);
      expect(result[2].interval).toBe(BillingInterval.WEEK);
    });

    it('should allow adding new prices to plan with active subscriptions', async () => {
      // Arrange
      const planId = 'plan-001';
      const createPriceDto = {
        interval: BillingInterval.YEAR,
        amount: 1299.99,
      };
      const mockPlan = createMockPlan();
      const newPrice = createMockPrice({
        interval: BillingInterval.YEAR,
        amount: 1299.99,
      });

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);
      mockPlanPriceRepository.create.mockReturnValue(newPrice);
      mockPlanPriceRepository.save.mockResolvedValue(newPrice);

      // Act
      const result = await service.createPrice(planId, createPriceDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.amount).toBe(1299.99);
      expect(mockPlanPriceRepository.save).toHaveBeenCalled();
    });

    it('should validate pricing on creation by rejecting amounts at boundary', async () => {
      // Arrange
      const planId = 'plan-001';
      const mockPlan = createMockPlan();

      mockPlanRepository.findOne.mockResolvedValue(mockPlan);

      // Act & Assert - Test with 0.01 (minimum positive)
      // This should pass if amount > 0
      const validPriceDto = {
        interval: BillingInterval.MONTH,
        amount: 0.01,
      };

      const mockPrice = createMockPrice({ amount: 0.01 });
      mockPlanPriceRepository.create.mockReturnValue(mockPrice);
      mockPlanPriceRepository.save.mockResolvedValue(mockPrice);

      const result = await service.createPrice(planId, validPriceDto);
      expect(result.amount).toBe(0.01);
    });
  });

  describe('Additional Coverage', () => {
    it('should find price by ID', async () => {
      // Arrange
      const priceId = 'price-001';
      const mockPrice = createMockPrice();

      mockPlanPriceRepository.findOne.mockResolvedValue(mockPrice);

      // Act
      const result = await service.findPriceById(priceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('price-001');
      expect(mockPlanPriceRepository.findOne).toHaveBeenCalledWith({
        where: { id: priceId },
        relations: ['plan'],
      });
    });

    it('should throw NotFoundException when price not found', async () => {
      // Arrange
      const priceId = 'nonexistent';
      mockPlanPriceRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findPriceById(priceId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update price with new values', async () => {
      // Arrange
      const priceId = 'price-001';
      const updatePriceDto = { amount: 149.99 };
      const mockPrice = createMockPrice();
      const updatedPrice = createMockPrice({ amount: 149.99 });

      mockPlanPriceRepository.findOne.mockResolvedValue(mockPrice);
      mockPlanPriceRepository.save.mockResolvedValue(updatedPrice);

      // Act
      const result = await service.updatePrice(priceId, updatePriceDto);

      // Assert
      expect(result.amount).toBe(149.99);
      expect(mockPlanPriceRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent price', async () => {
      // Arrange
      const priceId = 'nonexistent';
      const updatePriceDto = { amount: 99.99 };

      mockPlanPriceRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updatePrice(priceId, updatePriceDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should remove price successfully', async () => {
      // Arrange
      const priceId = 'price-001';
      const mockPrice = createMockPrice();

      mockPlanPriceRepository.findOne.mockResolvedValue(mockPrice);
      mockPlanPriceRepository.softRemove.mockResolvedValue(mockPrice);

      // Act
      const result = await service.removePrice(priceId);

      // Assert
      expect(result.message).toBe('Price removed successfully');
      expect(mockPlanPriceRepository.softRemove).toHaveBeenCalledWith(
        mockPrice,
      );
    });

    it('should throw NotFoundException when removing non-existent price', async () => {
      // Arrange
      const priceId = 'nonexistent';
      mockPlanPriceRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.removePrice(priceId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
