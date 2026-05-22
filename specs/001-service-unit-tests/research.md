# Research: Jest and NestJS Unit Testing Best Practices

**Date**: May 22, 2026
**Feature**: Unit Tests for Plan and Subscription Services

## Overview

This research consolidates best practices for unit testing NestJS services with Jest, focusing on mocking strategies, test isolation, and achieving high code coverage.

## Key Findings

### 1. Test Framework & Configuration

**Decision**: Jest with ts-jest preset

**Rationale**: 
- Configured in project package.json with full support for TypeScript
- Zero-config with NestJS projects when using ts-jest
- Superior to alternatives (Mocha, Vitest) for NestJS due to built-in TypeORM mock support
- Supports parallel execution for faster test runs
- Excellent debugging with --inspect-brk flag

**Existing Setup**: 
- jest.config.js already configured with ts-jest
- Scripts available: test, test:watch, test:cov
- E2E tests configured separately in test/jest-e2e.json

### 2. NestJS Service Testing Pattern

**Decision**: Use @nestjs/testing Test module builder with mock providers

**Rationale**:
- Maintains dependency injection without requiring actual database
- Follows NestJS recommended testing patterns
- Enables full provider mocking (repositories, services, external dependencies)
- Preserves service logic testing while eliminating database coupling

**Pattern**:
```typescript
const module = await Test.createTestingModule({
  providers: [
    ServiceToTest,
    {
      provide: RepositoryToken,
      useValue: mockRepository,
    },
  ],
}).compile();

const service = module.get<ServiceType>(ServiceType);
```

### 3. Repository Mocking Strategy

**Decision**: Mock TypeORM Repository interface with Jest mock functions

**Rationale**:
- TypeORM repositories follow standard interface patterns (findOne, find, save, etc.)
- Jest mocks integrate seamlessly with TypeORM's Repository<Entity> type
- Enables complete isolation from database while preserving type safety
- Realistic: tests validate business logic without db dependency

**Key Repository Methods to Mock**:
- findOne() - single entity retrieval with where conditions
- find() - collection retrieval with optional relations
- save() - entity persistence
- softRemove() - logical deletion
- create() - entity instantiation
- count() / query operations - aggregate functions

### 4. Test Organization & Naming

**Decision**: Organize tests by business rule (FR-XXX) with arrange-act-assert pattern

**Rationale**:
- Each functional requirement maps to test suite describe block
- Acceptance scenarios become individual test cases
- Clear linkage between spec requirements and test code
- Edge cases organized under separate describe blocks

**File Naming**: 
- Existing: `*.service.spec.ts` in same directory as service
- Pattern: One spec file per service
- Structure: Group by requirement, then by scenario

### 5. Mocking Service Dependencies

**Decision**: Mock injected service dependencies similarly to repositories

**Rationale**:
- SubscriptionService depends on PlanService: mock PlanService methods
- UserService dependency: mock user lookup methods
- Enables testing subscription business logic in isolation
- Prevents cascading failures when testing dependent services

**Pattern**:
```typescript
{
  provide: DependentService,
  useValue: {
    methodName: jest.fn(),
  },
}
```

### 6. Test Data & Fixtures

**Decision**: Create minimal test data objects as needed; no shared fixtures

**Rationale**:
- Each test should be independent and explicit
- Avoids hidden dependencies on test setup
- Makes assertions clear (what data was used in this test?)
- Easier to debug when tests fail

**Pattern**: Create factory functions for common test entities
```typescript
const createMockPlan = (overrides = {}): Plan => ({
  id: 'test-id',
  name: 'Test Plan',
  ...overrides,
});
```

### 7. Assertion Strategy

**Decision**: Use Jest built-in matchers for validation

**Rationale**:
- toEqual, toStrictEqual for object comparison
- toThrow for exception validation
- toHaveBeenCalledWith for mock verification
- toBeCalledTimes for invocation counting
- Clear, readable assertions without external libraries

### 8. Edge Case Testing

**Decision**: Separate edge case tests under dedicated describe blocks

**Rationale**:
- Main tests cover happy path and documented requirements
- Edge cases isolated for clarity and maintenance
- Makes gap analysis easier: "known limitations" vs "bugs"

**Priority Edge Cases** (from spec):
- Soft-deleted plan subscription attempt
- Retroactive start dates
- Concurrent subscription creation
- Non-existent entity lookups
- Invalid relationship references

## Coverage Targets

- **Minimum**: 90% statement coverage for both PlanService and SubscriptionService
- **Target**: 95%+ line coverage with emphasis on business rule paths
- **Execution Time**: All tests complete in < 5 seconds (typical: 1-2 seconds)

## Best Practices Applied

1. **One assertion focus per test**: Each test validates one behavior
2. **Descriptive test names**: "should prevent duplicate active subscriptions" vs "should test subscriptions"
3. **Mock verification**: Assert mock was called correctly, not just return values
4. **No database access**: Zero I/O operations in test code
5. **Deterministic tests**: No flaky timeouts, random data, or race conditions
6. **Independence**: Each test runs identically regardless of execution order

## Dependencies Confirmed

- jest@^29.0.0 (or similar - in package.json)
- @nestjs/testing@^11.0.0+ (in package.json dependencies)
- ts-jest preset (configured in jest.config.js)
- TypeScript support via tsconfig.json paths configuration

## No Clarifications Needed

The specification contained no ambiguous areas requiring research. All technical decisions derived from:
- Existing project configuration (Jest, NestJS, TypeORM)
- Standard NestJS testing patterns
- Business rules clearly defined in specification
- Project constraints (mocked repositories, fast execution)
