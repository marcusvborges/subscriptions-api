# Test Architecture & Data Model

**Feature**: Unit Tests for Plan and Subscription Services
**Date**: May 22, 2026

## Test Architecture Overview

### Service Testing Structure

#### PlanService Tests (`src/modules/plan/plan.service.spec.ts`)

**Dependencies to Mock**:
- `planRepository: Repository<Plan>` - TypeORM repository
- `planPriceRepository: Repository<PlanPrice>` - TypeORM repository  
- `subscriptionService: SubscriptionService` - dependent service

**Test Modules**:

```typescript
// Base setup used in all PlanService tests
const testingModule = await Test.createTestingModule({
  providers: [
    PlanService,
    {
      provide: 'PlanRepository',
      useValue: mockPlanRepository,
    },
    {
      provide: 'PlanPriceRepository',
      useValue: mockPlanPriceRepository,
    },
    {
      provide: SubscriptionService,
      useValue: mockSubscriptionService,
    },
  ],
}).compile();
```

#### SubscriptionService Tests (`src/modules/subscription/subscription.service.spec.ts`)

**Dependencies to Mock**:
- `subscriptionRepository: Repository<Subscription>` - TypeORM repository
- `userService: UserService` - user lookup service
- `planService: PlanService` - plan lookup service

**Test Modules**:

```typescript
// Base setup used in all SubscriptionService tests
const testingModule = await Test.createTestingModule({
  providers: [
    SubscriptionService,
    {
      provide: 'SubscriptionRepository',
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
```

### Data Model for Testing

#### Plan Entity (Test Data)

```typescript
interface PlanTestData {
  id: string;
  name: string;
  description: string;
  active: boolean;
  deletedAt?: Date | null;
  prices?: PlanPrice[];
  createdAt: Date;
  updatedAt: Date;
}

// Example: Valid plan
{
  id: 'plan-001',
  name: 'Professional Plan',
  description: 'Monthly professional subscription',
  active: true,
  deletedAt: null,
  prices: [{ id: 'price-001', amount: 99.99, billingInterval: 'MONTHLY' }],
  createdAt: new Date('2026-05-01'),
  updatedAt: new Date('2026-05-01'),
}

// Example: Soft-deleted plan
{
  id: 'plan-002',
  name: 'Legacy Plan',
  active: true, // Note: still marked active, but deletedAt set
  deletedAt: new Date('2026-05-15'),
}
```

#### PlanPrice Entity (Test Data)

```typescript
interface PlanPriceTestData {
  id: string;
  plan: Plan;
  amount: number;
  billingInterval: 'MONTHLY' | 'ANNUAL';
  currency: string;
  createdAt: Date;
}

// Valid pricing
{
  id: 'price-001',
  plan: { id: 'plan-001', ... },
  amount: 99.99,
  billingInterval: 'MONTHLY',
  currency: 'BRL',
  createdAt: new Date('2026-05-01'),
}

// Invalid pricing (zero)
{
  id: 'price-invalid',
  amount: 0,
  billingInterval: 'MONTHLY',
}

// Invalid pricing (negative)
{
  id: 'price-invalid',
  amount: -50,
  billingInterval: 'MONTHLY',
}
```

#### Subscription Entity (Test Data)

```typescript
interface SubscriptionTestData {
  id: string;
  user: User;
  plan: Plan;
  price?: PlanPrice;
  active: boolean;
  startDate: Date;
  expiresAt: Date;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Active subscription
{
  id: 'sub-001',
  user: { id: 'user-001', email: 'test@example.com' },
  plan: { id: 'plan-001', name: 'Professional Plan' },
  active: true,
  startDate: new Date('2026-05-01'),
  expiresAt: new Date('2026-06-01'),
  cancelledAt: null,
  createdAt: new Date('2026-05-01'),
}

// Cancelled subscription
{
  id: 'sub-002',
  user: { id: 'user-001' },
  plan: { id: 'plan-001' },
  active: false,
  startDate: new Date('2026-04-01'),
  expiresAt: new Date('2026-05-01'),
  cancelledAt: new Date('2026-04-15'),
}

// Expired subscription
{
  id: 'sub-003',
  active: false,
  expiresAt: new Date('2026-04-01'), // Past date
}
```

## Mock Repository Implementations

### PlanRepository Mock

```typescript
const mockPlanRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  softRemove: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  }),
};
```

### SubscriptionRepository Mock

```typescript
const mockSubscriptionRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};
```

### UserService Mock

```typescript
const mockUserService = {
  findOne: jest.fn(),
};
```

### PlanService Mock

```typescript
const mockPlanService = {
  findOne: jest.fn(),
  findPriceById: jest.fn(),
  countActiveSubscriptionsByPlan: jest.fn(),
};
```

## Test Execution Flow

### Before Each Test Suite
1. Initialize test module with mocked dependencies
2. Get service instance from test module
3. Reset all jest mocks: `jest.clearAllMocks()`

### During Each Test
1. **Arrange**: Set up test data and mock return values
   ```typescript
   const mockPlan = { id: 'plan-001', name: 'Test Plan' };
   mockPlanRepository.findOne.mockResolvedValue(mockPlan);
   ```

2. **Act**: Call service method under test
   ```typescript
   const result = await service.findOne('plan-001');
   ```

3. **Assert**: Verify behavior (return value and mock calls)
   ```typescript
   expect(result).toEqual(mockPlan);
   expect(mockPlanRepository.findOne).toHaveBeenCalledWith({ where: { id: 'plan-001' } });
   ```

### After Each Test
- No cleanup needed (jest.clearAllMocks() runs before each test)
- Memory clean: all mocks are re-created per test

## Edge Case Test Data

### Soft-Deleted Plan Subscription Attempt
```typescript
{
  plan: { id: 'plan-001', deletedAt: new Date() },
  subscriptionAttempt: { userId: 'user-001', planId: 'plan-001' },
  expectedResult: 'Should reject or handle gracefully'
}
```

### Concurrent Subscription Creation
```typescript
// Two simultaneous requests for same customer-plan pair
request1: { userId: 'user-001', planId: 'plan-001' }
request2: { userId: 'user-001', planId: 'plan-001' }
// Both submitted before either completes
```

### Retroactive Start Date
```typescript
{
  startDate: pastDate,
  expiresAt: futureDate,
  billingInterval: 'MONTHLY',
  expectedBehavior: 'Calculate expiration correctly despite past start'
}
```

## Code Coverage Targets

**Target for Each Service**: 90% minimum

- **PlanService Methods**:
  - create() - FR-001
  - findAll() - FR-006 filtering
  - findOne() - lookup validation
  - update() - FR-004
  - remove() / softDelete - FR-005, FR-006
  - createPrice() - pricing creation
  - findPricesByPlan() - price retrieval
  - findPriceById() - price lookup

- **SubscriptionService Methods**:
  - create() - FR-007, FR-008, FR-009
  - findAll() / findOne() / findByUser() - retrieval
  - cancel() - FR-010
  - expiration validation - FR-011, FR-012
  - history queries - FR-013, FR-014

**Coverage Measurement**: Run `npm run test:cov` after tests complete
