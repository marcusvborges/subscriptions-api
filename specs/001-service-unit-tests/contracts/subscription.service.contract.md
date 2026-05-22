# Test File Contract: SubscriptionService Tests

**File**: `src/modules/subscription/subscription.service.spec.ts`

## Purpose

Define the structure and organization of unit tests for SubscriptionService. This contract ensures tests are:
- Organized by functional requirement
- Independently executable
- Consistent with NestJS testing patterns
- Traceable back to specification requirements

## File Structure

```typescript
describe('SubscriptionService', () => {
  // 1. Service setup
  let service: SubscriptionService;
  let mockSubscriptionRepository;
  let mockUserService;
  let mockPlanService;

  // 2. Module initialization
  beforeEach(async () => {
    const module = await Test.createTestingModule({...}).compile();
    service = module.get<SubscriptionService>(SubscriptionService);
    // Extract mocks for verification
  });

  // 3. Test suites by functional requirement
  describe('FR-007: Create Subscription', () => {
    // FR-007 tests
  });

  describe('FR-008/FR-009: Duplicate Prevention', () => {
    // FR-008/FR-009 tests
  });

  // ... additional FR suites

  describe('Edge Cases', () => {
    // Edge case tests
  });
});
```

## Required Test Suites

### 1. FR-007: Create Subscription Successfully

**Requirement**: SubscriptionService MUST successfully create subscriptions with valid customer ID and plan ID references

**Test Name**: `should create subscription with valid user and plan`
- **Arrange**: Valid CreateSubscriptionDto with userId and planId
- **Arrange**: Mock userService.findOne() returns valid user
- **Arrange**: Mock planService.findOne() returns valid plan
- **Act**: Call service.create()
- **Assert**: Returns subscription with id, user, plan, active=true

**Test Name**: `should throw error if user not found`
- **Arrange**: CreateSubscriptionDto with invalid userId
- **Arrange**: Mock userService.findOne() returns null
- **Act**: Call service.create()
- **Assert**: Throws NotFoundException

**Test Name**: `should throw error if plan not found`
- **Arrange**: CreateSubscriptionDto with invalid planId
- **Arrange**: Mock planService.findOne() returns null
- **Act**: Call service.create()
- **Assert**: Throws NotFoundException

**Test Name**: `should set start date and expiration correctly`
- **Arrange**: Valid CreateSubscriptionDto
- **Act**: Call service.create()
- **Assert**: startDate = today, expiresAt = today + 1 month

**Test Name**: `should link plan price if provided`
- **Arrange**: CreateSubscriptionDto with planPriceId
- **Arrange**: Mock planService.findPriceById() returns valid price
- **Act**: Call service.create()
- **Assert**: Subscription includes plan price

### 2. FR-008: Prevent Duplicate Active Subscriptions

**Requirement**: SubscriptionService MUST prevent creation of duplicate active subscriptions for same customer-plan combination

**Test Name**: `should reject second active subscription for same user`
- **Arrange**: User with existing active subscription
- **Arrange**: Mock subscriptionRepository.findOne() returns active subscription
- **Act**: Call service.create() with same user
- **Assert**: Throws BadRequestException with "already has an active subscription"

**Test Name**: `should verify duplicate check queries correctly`
- **Arrange**: CreateSubscriptionDto
- **Act**: Call service.create()
- **Assert**: Verify findOne() called with where: { user.id, active: true }

### 3. FR-009: Allow New Subscription After Cancellation

**Requirement**: SubscriptionService MUST allow new subscriptions only if no active subscription exists for that customer-plan pair

**Test Name**: `should allow new subscription if previous one is cancelled`
- **Arrange**: User with cancelled (active=false) subscription
- **Arrange**: Mock findOne() returns null (no active subscription)
- **Act**: Call service.create()
- **Assert**: Creates new subscription successfully

**Test Name**: `should distinguish between cancelled and active subscriptions`
- **Arrange**: User with both cancelled and active subscriptions
- **Act**: Call service.create()
- **Assert**: Checks for active=true, not all subscriptions

### 4. FR-010: Cancel Subscription

**Requirement**: SubscriptionService MUST support cancellation of active subscriptions with status change and timestamp recording

**Test Name**: `should cancel active subscription`
- **Arrange**: Active subscription from repository
- **Act**: Call service.cancel()
- **Assert**: Sets active=false and updates cancelledAt timestamp

**Test Name**: `should exclude cancelled subscription from active queries`
- **Arrange**: Cancelled subscription (active=false, cancelledAt set)
- **Act**: Query via findAll() or findOne()
- **Assert**: Filters out cancelled subscription in active queries

### 5. FR-011: Calculate Expiration Dates

**Requirement**: SubscriptionService MUST calculate subscription expiration dates correctly based on start date and billing interval

**Test Name**: `should calculate next billing date for monthly plan`
- **Arrange**: Subscription with startDate and 1-month billing interval
- **Act**: Verify expiresAt calculation
- **Assert**: expiresAt = startDate + 1 month

**Test Name**: `should calculate next billing date for annual plan`
- **Arrange**: Subscription with startDate and 12-month billing interval
- **Act**: Verify expiresAt calculation
- **Assert**: expiresAt = startDate + 1 year

### 6. FR-012: Validate Expiration Dates

**Requirement**: SubscriptionService MUST validate expiration dates are after subscription start dates

**Test Name**: `should reject expiration date before start date`
- **Arrange**: CreateSubscriptionDto with expiresAt < startDate
- **Act**: Call service.create()
- **Assert**: Throws validation error or BadRequestException

**Test Name**: `should validate date logic during creation`
- **Arrange**: Valid subscription with calculated dates
- **Act**: Call service.create()
- **Assert**: expiresAt always > startDate

### 7. FR-013: Preserve Historical Records

**Requirement**: SubscriptionService MUST preserve all historical subscription records through cancellations and updates

**Test Name**: `should keep subscription record after cancellation`
- **Arrange**: Active subscription to cancel
- **Act**: Call service.cancel()
- **Assert**: Subscription record exists in DB (not deleted), just marked inactive

**Test Name**: `should maintain audit trail with timestamps`
- **Arrange**: Subscription with created, updated, and cancelled timestamps
- **Act**: Query historical subscription
- **Assert**: All timestamps present and accurate

### 8. FR-014: Retrieve Complete Subscription History

**Requirement**: SubscriptionService MUST retrieve complete subscription history including cancelled and expired subscriptions

**Test Name**: `should retrieve all subscriptions for user including cancelled`
- **Arrange**: User with active, cancelled, and expired subscriptions
- **Act**: Call service.findByUser()
- **Assert**: Returns all subscriptions regardless of status

**Test Name**: `should include subscription metadata in history`
- **Arrange**: Historical subscription query
- **Act**: Call service.findByUser() or findAll()
- **Assert**: Returns subscriptions with plan, user, dates, and status

**Test Name**: `should distinguish subscription status in results`
- **Arrange**: Mixed subscription statuses
- **Act**: Query subscriptions
- **Assert**: Includes active, cancelled, and expired status info

## Mock Service Interface

### SubscriptionRepository Mock
```typescript
{
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
}
```

### UserService Mock
```typescript
{
  findOne: jest.fn(),  // Returns user or null
}
```

### PlanService Mock
```typescript
{
  findOne: jest.fn(),              // Returns plan or throws
  findPriceById: jest.fn(),        // Returns price or null
  countActiveSubscriptionsByPlan: jest.fn(),  // Returns number
}
```

## Edge Cases

### Edge Case: Soft-Deleted Plan Subscription

**Test Name**: `should validate plan exists and is active`
- **Arrange**: Plan with deletedAt set
- **Arrange**: Mock planService.findOne() to return deleted plan
- **Act**: Call service.create()
- **Assert**: Either throws or indicates inactive plan

### Edge Case: Concurrent Subscription Creation

**Test Name**: `should handle concurrent creation attempts (implementation behavior)`
- **Arrange**: Two simultaneous create() calls for same user
- **Act**: Both requests processed
- **Assert**: One succeeds, one fails with duplicate error (DB-level or app-level handling)

### Edge Case: Retroactive Start Date

**Test Name**: `should accept historical start dates and calculate expiration`
- **Arrange**: startDate = 30 days ago
- **Act**: Call service.create()
- **Assert**: Calculates expiresAt correctly despite past start date

### Edge Case: Non-Existent User Lookup

**Test Name**: `should throw when user does not exist`
- **Arrange**: CreateSubscriptionDto with non-existent userId
- **Arrange**: Mock userService.findOne() returns null
- **Act**: Call service.create()
- **Assert**: Throws NotFoundException

### Edge Case: Plan Price Mismatch

**Test Name**: `should validate plan price belongs to selected plan`
- **Arrange**: PlanPrice from different Plan
- **Act**: Call service.create() with mismatched planId and planPriceId
- **Assert**: Throws BadRequestException

## Coverage Targets

- **Minimum**: 90% line coverage for subscription.service.ts
- **Statement Coverage**: All FR-007 through FR-014 paths covered
- **Branch Coverage**: Error conditions tested (all exceptions, null checks, status conditions)

## Notes

- Each test is independent; order should not matter
- Mocks reset before each test via jest.clearAllMocks()
- Use realistic test data matching entity field types and constraints
- Document any non-obvious mock behavior or test setup
- Verify mock service method calls match actual service interface
