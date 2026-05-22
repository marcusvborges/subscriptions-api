# Tasks: Unit Tests for Plan and Subscription Services

**Input**: Design documents from `/specs/001-service-unit-tests/`

**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

**Feature**: Unit test suite for PlanService and SubscriptionService with 90%+ code coverage

**Branch**: `001-service-unit-tests`

**Organization**: Tasks organized by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US6)
- Exact file paths provided in descriptions

---

## Phase 1: Test Infrastructure Setup

**Purpose**: Initialize test module configurations and mock infrastructure shared across all tests

- [ ] T001 Create test setup utilities in `src/modules/plan/test-fixtures.ts` for PlanService mock repositories and test data factories
- [ ] T002 [P] Create test setup utilities in `src/modules/subscription/test-fixtures.ts` for SubscriptionService mocks and test data factories
- [ ] T003 Install/verify test dependencies: `@nestjs/testing` (v11+) with Jest configuration in package.json and jest.config.js

---

## Phase 2: Test Foundation & Module Initialization

**Purpose**: Set up base test module configurations for both services

- [ ] T004 [P] Initialize PlanService test module in `src/modules/plan/plan.service.spec.ts` with Test.createTestingModule(), mocked repositories, and beforeEach() hooks
- [ ] T005 [P] Initialize SubscriptionService test module in `src/modules/subscription/subscription.service.spec.ts` with Test.createTestingModule(), mocked services/repositories, and beforeEach() hooks
- [ ] T006 [P] Create shared mock factory functions for Plan, PlanPrice, Subscription entities in respective test-fixtures.ts files
- [ ] T007 Verify test module initialization: `npm test -- plan.service.spec.ts` and `npm test -- subscription.service.spec.ts` execute without errors

---

## Phase 3: User Story 1 - Validate Plan Creation and Pricing Rules (P1)

**Independent Test Criteria**: FR-001 and FR-002 tests pass; plan creation and pricing validation work in isolation

**Functional Requirements**: FR-001 (create plan), FR-002 (validate pricing)

### Test Implementation Tasks

- [ ] T008 [P] [US1] Implement describe('FR-001: Create Plan', ...) test suite in `src/modules/plan/plan.service.spec.ts` with test cases:
  - "should create a new plan with valid data"
  - "should throw ConflictException if plan name already exists"
  - "should persist plan with correct fields to repository"
  
- [ ] T009 [P] [US1] Implement describe('FR-002: Validate Pricing', ...) test suite in `src/modules/plan/plan.service.spec.ts` with test cases:
  - "should reject plan with zero price (amount = 0)"
  - "should reject plan with negative price (amount = -99.99)"
  - "should accept plan with positive price (amount = 99.99)"

- [ ] T010 [US1] Verify US1 test coverage: `npm run test:cov -- plan.service.spec.ts` shows FR-001 and FR-002 paths with 90%+ coverage; run `npm test -- --testNamePattern="FR-001|FR-002"` to verify all 5 tests pass

---

## Phase 4: User Story 2 - Validate Billing Interval and Plan Updates (P1)

**Independent Test Criteria**: FR-003 and FR-004 tests pass; billing interval validation and updates work independently

**Functional Requirements**: FR-003 (validate billing interval), FR-004 (update plan)

### Test Implementation Tasks

- [ ] T011 [P] [US2] Implement describe('FR-003: Validate Billing Interval', ...) test suite in `src/modules/plan/plan.service.spec.ts` with test cases:
  - "should accept valid billing intervals (MONTHLY, ANNUAL)"
  - "should reject invalid billing interval values"
  
- [ ] T012 [P] [US2] Implement describe('FR-004: Update Plan', ...) test suite in `src/modules/plan/plan.service.spec.ts` with test cases:
  - "should update plan name and description without affecting subscriptions"
  - "should not call subscriptionService when updating metadata"

- [ ] T013 [US2] Verify US2 test coverage: `npm run test:cov -- plan.service.spec.ts` shows FR-003 and FR-004 paths covered; run `npm test -- --testNamePattern="FR-003|FR-004"` to verify all 3 tests pass

---

## Phase 5: User Story 3 - Validate Plan Soft Delete and Historical Record Keeping (P1)

**Independent Test Criteria**: FR-005 and FR-006 tests pass; soft delete and active plan filtering work independently

**Functional Requirements**: FR-005 (soft delete), FR-006 (exclude deleted plans)

### Test Implementation Tasks

- [ ] T014 [P] [US3] Implement describe('FR-005: Soft Delete Plan', ...) test suite in `src/modules/plan/plan.service.spec.ts` with test cases:
  - "should soft delete plan successfully when no active subscriptions"
  - "should throw BadRequestException when attempting to delete plan with active subscriptions"
  - "should call subscriptionService.countActiveSubscriptionsByPlan() before delete"

- [ ] T015 [P] [US3] Implement describe('FR-006: Exclude Soft-Deleted Plans', ...) test suite in `src/modules/plan/plan.service.spec.ts` with test cases:
  - "should return only active plans when calling findAll(activeOnly: true)"
  - "should return all plans including soft-deleted when calling findAll(activeOnly: false)"

- [ ] T016 [US3] Verify US3 test coverage: `npm run test:cov -- plan.service.spec.ts` shows FR-005 and FR-006 soft delete paths covered; run `npm test -- --testNamePattern="FR-005|FR-006"` to verify all 4 tests pass

---

## Phase 6: User Story 4 - Validate Subscription Creation and Duplicate Prevention (P1)

**Independent Test Criteria**: FR-007, FR-008, FR-009 tests pass; subscription creation and duplicate prevention work independently

**Functional Requirements**: FR-007 (create subscription), FR-008 (prevent duplicates), FR-009 (allow after cancel)

### Test Implementation Tasks

- [ ] T017 [P] [US4] Implement describe('FR-007: Create Subscription', ...) test suite in `src/modules/subscription/subscription.service.spec.ts` with test cases:
  - "should create subscription with valid user and plan"
  - "should throw NotFoundException if user not found"
  - "should throw NotFoundException if plan not found"
  - "should set startDate to today and expiresAt to today + 1 month"
  - "should link planPrice if provided in createSubscriptionDto"

- [ ] T018 [P] [US4] Implement describe('FR-008/FR-009: Duplicate Prevention & Allow After Cancel', ...) test suite in `src/modules/subscription/subscription.service.spec.ts` with test cases:
  - "should reject second active subscription for same user (FR-008)"
  - "should verify duplicate check queries for active: true only (FR-008)"
  - "should allow new subscription if previous one is cancelled (FR-009)"
  - "should distinguish between cancelled (active=false) and active subscriptions (FR-009)"

- [ ] T019 [US4] Verify US4 test coverage: `npm run test:cov -- subscription.service.spec.ts` shows FR-007, FR-008, FR-009 paths covered; run `npm test -- --testNamePattern="FR-007|FR-008|FR-009"` to verify all 7 tests pass

---

## Phase 7: User Story 5 - Validate Subscription Cancellation and Expiration Rules (P2)

**Independent Test Criteria**: FR-010, FR-011, FR-012 tests pass; cancellation and expiration validation work independently

**Functional Requirements**: FR-010 (cancel subscription), FR-011 (calculate expiration), FR-012 (validate expiration dates)

### Test Implementation Tasks

- [ ] T020 [P] [US5] Implement describe('FR-010: Cancel Subscription', ...) test suite in `src/modules/subscription/subscription.service.spec.ts` with test cases:
  - "should cancel active subscription and set active=false with cancelledAt timestamp"
  - "should exclude cancelled subscription from active queries"

- [ ] T021 [P] [US5] Implement describe('FR-011: Calculate Expiration', ...) test suite in `src/modules/subscription/subscription.service.spec.ts` with test cases:
  - "should calculate next billing date for monthly plan (startDate + 1 month)"
  - "should calculate next billing date for annual plan (startDate + 1 year)"

- [ ] T022 [P] [US5] Implement describe('FR-012: Validate Expiration Dates', ...) test suite in `src/modules/subscription/subscription.service.spec.ts` with test cases:
  - "should reject subscription with expiresAt before startDate"
  - "should validate expiresAt > startDate in all subscription creation paths"

- [ ] T023 [US5] Verify US5 test coverage: `npm run test:cov -- subscription.service.spec.ts` shows FR-010, FR-011, FR-012 paths covered; run `npm test -- --testNamePattern="FR-010|FR-011|FR-012"` to verify all 6 tests pass

---

## Phase 8: User Story 6 - Validate Historical Subscription Records (P2)

**Independent Test Criteria**: FR-013 and FR-014 tests pass; historical record preservation and querying work independently

**Functional Requirements**: FR-013 (preserve historical records), FR-014 (retrieve subscription history)

### Test Implementation Tasks

- [ ] T024 [P] [US6] Implement describe('FR-013: Preserve Historical Records', ...) test suite in `src/modules/subscription/subscription.service.spec.ts` with test cases:
  - "should keep subscription record after cancellation (not deleted, just marked inactive)"
  - "should maintain audit trail with created, updated, and cancelled timestamps"

- [ ] T025 [P] [US6] Implement describe('FR-014: Retrieve Subscription History', ...) test suite in `src/modules/subscription/subscription.service.spec.ts` with test cases:
  - "should retrieve all subscriptions for user including cancelled and expired"
  - "should include subscription metadata (plan, user, dates, status) in history results"
  - "should distinguish subscription status (active, cancelled, expired) in query results"

- [ ] T026 [US6] Verify US6 test coverage: `npm run test:cov -- subscription.service.spec.ts` shows FR-013 and FR-014 paths covered; run `npm test -- --testNamePattern="FR-013|FR-014"` to verify all 5 tests pass

---

## Phase 9: Edge Cases & Coverage Verification

**Purpose**: Implement edge case tests and verify complete coverage against spec

### Edge Case Test Implementation

- [ ] T027 [P] Implement edge case tests in `src/modules/plan/plan.service.spec.ts`:
  - describe('Edge Cases - Plan', ...) with tests for soft-deleted plan behavior
  
- [ ] T028 [P] Implement edge case tests in `src/modules/subscription/subscription.service.spec.ts`:
  - describe('Edge Cases - Subscription', ...) with tests for:
    - Creating subscription with soft-deleted plan (should reject)
    - Retroactive start dates (should calculate expiration correctly)
    - Non-existent user lookup (should throw NotFoundException)
    - Plan price mismatch validation (price from different plan)

### Coverage & Compliance Verification

- [ ] T029 Run full test suite and verify results: `npm test` - all tests pass, execution < 5 seconds
- [ ] T030 Generate coverage report: `npm run test:cov` and verify:
  - PlanService: 90%+ line coverage (all FR-001 through FR-006)
  - SubscriptionService: 90%+ line coverage (all FR-007 through FR-014)
  - Both services show 100% statement coverage for business rule paths

- [ ] T031 Verify test independence: `npm test -- --testNamePattern="US[1-6]" --maxWorkers=4` runs successfully with all tests passing (parallel execution)

- [ ] T032 Validate specification compliance:
  - All 6 user stories have corresponding passing test suites
  - All 14 functional requirements (FR-001 through FR-014) have test coverage
  - All 5 edge cases from spec documented and tested
  - Success criteria SC-001 through SC-005 satisfied

---

## Phase 10: Documentation & Final Handoff

**Purpose**: Document test architecture and prepare for future maintenance

- [ ] T033 Update [quickstart.md](../quickstart.md) with actual test execution results and coverage percentages
- [ ] T034 Create `TEST_DOCUMENTATION.md` in specs/001-service-unit-tests/ documenting:
  - Test patterns used (arrange-act-assert)
  - Mock factory functions and their usage
  - Common test scenarios and how to extend
  - Troubleshooting guide for test failures
  
- [ ] T035 Commit final tests with message: "feat: implement unit tests for PlanService and SubscriptionService

  - PlanService tests: FR-001 through FR-006 (6 test suites, 14 test cases)
  - SubscriptionService tests: FR-007 through FR-014 (8 test suites, 18 test cases)
  - Mock repositories with 100% isolation
  - Edge case coverage for specification requirements
  - 90%+ line coverage for both services
  - All tests execute in <5 seconds"

---

## Dependency Graph & Execution Order

```
Phase 1: Setup (T001-T003)
    ↓
Phase 2: Foundation (T004-T007)
    ↓
Phase 3: US1 (T008-T010)  ← First user story (foundational for billing)
Phase 4: US2 (T011-T013)  ← Can start after T007
Phase 5: US3 (T014-T016)  ← Can start after T007
Phase 6: US4 (T017-T019)  ← Can start after T007
    ↓ (all P1 stories must complete before P2)
Phase 7: US5 (T020-T023)  ← Depends on US4 (subscription lifecycle)
Phase 8: US6 (T024-T026)  ← Depends on US4 & US5 (history/audit)
    ↓
Phase 9: Edge Cases (T027-T032)
Phase 10: Documentation (T033-T035)
```

## Parallel Execution Opportunities

**Parallel Batch 1** (After Phase 2, can start simultaneously):
- T008 + T009 (US1 test suites, different test cases in plan.service.spec.ts)
- T011 + T012 (US2 test suites, different test cases in plan.service.spec.ts)
- T014 + T015 (US3 test suites, different test cases in plan.service.spec.ts)
- T017 + T018 (US4 test suites, different test cases in subscription.service.spec.ts)

**Parallel Batch 2** (After US1-US4, can start simultaneously):
- T020 + T021 + T022 (US5 test suites in subscription.service.spec.ts)
- T024 + T025 (US6 test suites in subscription.service.spec.ts)

**Parallel Batch 3** (After Phase 8, can start simultaneously):
- T027 + T028 (Edge case test suites in separate service files)

## Implementation Strategy

**MVP Scope** (Phase 1-3, ~2-3 hours):
- Complete Phase 1-2 infrastructure setup
- Implement User Story 1 (FR-001, FR-002) - plan creation and pricing validation
- Delivers: Basic test infrastructure + foundational plan tests

**Next Increment** (Phase 4-6, ~3-4 hours):
- User Stories 2-4 (FR-003 through FR-009)
- Delivers: Complete PlanService test coverage + subscription creation/duplicate prevention

**Final Increment** (Phase 7-10, ~2-3 hours):
- User Stories 5-6 + edge cases + documentation
- Delivers: Complete SubscriptionService coverage + historical records + edge cases

**Total Effort**: ~7-10 hours for complete implementation
**Team Size**: Single developer or two developers working in parallel on plan.service.spec.ts (T008-T015) vs subscription.service.spec.ts (T017-T026)

---

## Task Checklist Summary

**Total Tasks**: 35 (T001-T035)
- Setup & Foundation: 7 tasks (T001-T007)
- User Story 1 (Plan Creation): 3 tasks (T008-T010)
- User Story 2 (Billing Interval): 3 tasks (T011-T013)
- User Story 3 (Soft Delete): 3 tasks (T014-T016)
- User Story 4 (Subscription Creation): 3 tasks (T017-T019)
- User Story 5 (Cancellation): 4 tasks (T020-T023)
- User Story 6 (History): 3 tasks (T024-T026)
- Edge Cases & Verification: 6 tasks (T027-T032)
- Documentation & Handoff: 3 tasks (T033-T035)

**Parallelizable Tasks**: 16 (marked with [P])
**Sequential Critical Path**: 10 tasks (phases 1-2, then verification phases)
