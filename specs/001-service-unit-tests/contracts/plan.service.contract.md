# Test File Contract: PlanService Tests

**File**: `src/modules/plan/plan.service.spec.ts`

## Purpose

Define the structure and organization of unit tests for PlanService. This contract ensures tests are:
- Organized by functional requirement
- Independently executable
- Consistent with NestJS testing patterns
- Traceable back to specification requirements

## File Structure

```typescript
describe('PlanService', () => {
  // 1. Service setup
  let service: PlanService;
  let mockPlanRepository;
  let mockPlanPriceRepository;
  let mockSubscriptionService;

  // 2. Module initialization
  beforeEach(async () => {
    const module = await Test.createTestingModule({...}).compile();
    service = module.get<PlanService>(PlanService);
    // Extract mocks for verification
  });

  // 3. Test suites by functional requirement
  describe('FR-001: Create Plan', () => {
    // FR-001 tests
  });

  describe('FR-002: Validate Pricing', () => {
    // FR-002 tests
  });

  // ... additional FR suites

  describe('Edge Cases', () => {
    // Edge case tests
  });
});
```

## Required Test Suites

### 1. FR-001: Create Plan Successfully

**Requirement**: PlanService MUST successfully create plans with valid name, description, and pricing information

**Test Name**: `should create a new plan with valid data`
- **Arrange**: Valid CreatePlanDto
- **Act**: Call service.create()
- **Assert**: Returns plan with id, saved to repository

**Test Name**: `should throw error if plan name already exists`
- **Arrange**: Mock repository to find existing plan
- **Act**: Call service.create()
- **Assert**: Throws ConflictException

**Test Name**: `should persist plan with correct fields`
- **Arrange**: CreatePlanDto with name, description
- **Act**: Call service.create()
- **Assert**: Verify save() called with correct data

### 2. FR-002: Validate Pricing

**Requirement**: PlanService MUST validate that pricing values are positive numbers and reject zero or negative prices

**Test Name**: `should reject plan with zero price`
- **Arrange**: Price amount = 0
- **Act**: Call service.createPrice()
- **Assert**: Throws BadRequestException

**Test Name**: `should reject plan with negative price`
- **Arrange**: Price amount = -99.99
- **Act**: Call service.createPrice()
- **Assert**: Throws BadRequestException

**Test Name**: `should accept plan with positive price`
- **Arrange**: Price amount = 99.99
- **Act**: Call service.createPrice()
- **Assert**: Returns price entity

### 3. FR-003: Validate Billing Interval

**Requirement**: PlanService MUST validate billing intervals against allowed values (monthly, annual, etc.)

**Test Name**: `should accept valid billing intervals`
- **Arrange**: billingInterval = 'MONTHLY' or 'ANNUAL'
- **Act**: Call service.createPrice()
- **Assert**: Price created successfully

**Test Name**: `should reject invalid billing interval`
- **Arrange**: billingInterval = 'INVALID'
- **Act**: Call service.createPrice()
- **Assert**: Throws validation error

### 4. FR-004: Update Plan Metadata

**Requirement**: PlanService MUST support updating plan metadata (name, description) without affecting existing subscriptions

**Test Name**: `should update plan name and description`
- **Arrange**: Existing plan and UpdatePlanDto
- **Act**: Call service.update()
- **Assert**: Returns updated plan

**Test Name**: `should not affect related subscriptions on update`
- **Arrange**: Plan with existing subscriptions
- **Act**: Call service.update()
- **Assert**: Verify subscriptionService not called

### 5. FR-005: Soft Delete Plan

**Requirement**: PlanService MUST implement soft delete that marks plans as deleted without removing database records

**Test Name**: `should soft delete plan successfully`
- **Arrange**: Existing plan with no active subscriptions
- **Act**: Call service.remove()
- **Assert**: Calls softRemove(), returns success message

**Test Name**: `should prevent delete of plan with active subscriptions`
- **Arrange**: Plan with active subscriptions
- **Act**: Call service.remove()
- **Assert**: Throws BadRequestException

**Test Name**: `should verify no active subscriptions before delete`
- **Arrange**: Plan with subscriptions
- **Act**: Call service.remove()
- **Assert**: Calls countActiveSubscriptionsByPlan()

### 6. FR-006: Exclude Soft-Deleted Plans

**Requirement**: PlanService MUST exclude soft-deleted plans from active plan queries

**Test Name**: `should return only active plans when querying with activeOnly=true`
- **Arrange**: Mock repository to return mix of active/deleted
- **Act**: Call service.findAll(true)
- **Assert**: Filters deleted plans

**Test Name**: `should return all plans when querying with activeOnly=false`
- **Arrange**: Mix of active and soft-deleted plans in DB
- **Act**: Call service.findAll(false)
- **Assert**: Returns all plans including deleted

## Edge Cases

### Edge Case: Soft-Deleted Plan in findOne()

**Test Name**: `should return soft-deleted plan in findOne if queried directly`
- **Arrange**: Plan with deletedAt set
- **Act**: Call service.findOne(planId)
- **Assert**: Returns plan (caller responsible for filtering)

### Edge Case: Plan with Multiple Prices

**Test Name**: `should retrieve all prices for a plan`
- **Arrange**: Plan with 3 price tiers (monthly, annual, etc.)
- **Act**: Call service.findPricesByPlan()
- **Assert**: Returns all 3 prices with correct plan reference

### Edge Case: Update Pricing During Active Subscriptions

**Test Name**: `should not prevent price updates (implementation concern, not enforced)`
- **Arrange**: Plan with active subscriptions
- **Act**: Call service.createPrice() with new price
- **Assert**: New price created (spec says new subscriptions use new price)

## Mock Repository Interface

```typescript
// Expected mock methods called by PlanService
{
  create: jest.fn(),          // Creates new entity instance
  save: jest.fn(),            // Persists entity
  findOne: jest.fn(),         // Finds single entity by criteria
  find: jest.fn(),            // Finds multiple entities
  softRemove: jest.fn(),      // Soft delete entity
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  }),
}
```

## Coverage Targets

- **Minimum**: 90% line coverage for plan.service.ts
- **Statement Coverage**: All FR-001 through FR-006 paths covered
- **Branch Coverage**: Error conditions tested (exceptions, null checks)

## Notes

- Each test is independent; order should not matter
- Mocks reset before each test via jest.clearAllMocks()
- Use realistic test data matching entity field types
- Document any non-obvious mock behavior
