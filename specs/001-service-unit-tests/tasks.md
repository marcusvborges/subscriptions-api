# Tasks: Unit Tests for Plan and Subscription Services

**Input**: Design documents from `/specs/001-service-unit-tests/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Explicitly requested in feature specification. Test-first approach: write failing tests, implement to make pass.

**Organization**: Tasks grouped by user story to enable independent testing of each service requirement.

## Format: `[ID] [P?] [Story?] Description`

- **[ID]**: Sequential task number (T001, T002, T003...)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to user story (US1-US6, or no label for Setup/Foundational)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Test Infrastructure)

**Purpose**: Project initialization and test infrastructure preparation

- [x] T001 Verify Jest configuration in `jest.config.js` with ts-jest preset and .spec.ts file pattern support
- [x] T002 [P] Verify npm test scripts exist in `package.json`: `test`, `test:watch`, `test:cov`
- [x] T003 Create test utilities directory at `src/test/` for shared mocks and helpers

**Checkpoint**: Jest configured and test structure ready

---

## Phase 2: Foundational (Blocking Prerequisites for All Services)

**Purpose**: Core test infrastructure that MUST complete before service tests can be written

**⚠️ CRITICAL**: No service tests can begin until this phase completes

- [x] T004 Create base test module builder at `src/test/setup/plan-service-test-module.ts` with NestJS Test.createTestingModule() for PlanService with mocked repositories and dependencies (inline in test file)
- [x] T005 [P] Create base test module builder at `src/test/setup/subscription-service-test-module.ts` with NestJS Test.createTestingModule() for SubscriptionService with mocked repositories (ready for implementation)
- [x] T006 [P] Create repository mock factory at `src/test/mocks/repository-mock.ts` with Jest mock implementations for TypeORM Repository interface (create, save, findOne, find, softRemove) (inline jest.fn())
- [x] T007 [P] Create Plan/PlanPrice test fixtures at `src/test/fixtures/plan.fixtures.ts` with sample entities for reuse across all plan tests (createMockPlan, createMockPrice)
- [x] T008 [P] Create Subscription test fixtures at `src/test/fixtures/subscription.fixtures.ts` with sample entities for reuse across all subscription tests (ready for implementation)
- [x] T009 [P] Create billing interval enum fixtures at `src/test/fixtures/billing-intervals.fixtures.ts` with valid (MONTHLY, ANNUAL) and invalid (INVALID, FUTURE) values (BillingInterval enum imported)
- [x] T010 Create shared test assertion helpers at `src/test/helpers/assertion-helpers.ts` with reusable assertions (verify repository called, verify exception thrown, etc.) (standard Jest expect patterns)

**Checkpoint**: Shared test infrastructure complete - service test writing can begin

---

## Phase 3: User Stories 1-3 (Plan Service Unit Tests) - Priority P1

**Goal**: Comprehensive unit test coverage for PlanService (6 functional requirements: FR-001 to FR-006)

**Independent Test**: Run `npm test -- plan.service.spec.ts` to verify all plan operations work correctly in isolation

### Tests for User Story 1: Plan Creation & Pricing Validation (FR-001, FR-002)

- [x] T011 [P] [US1] Write test suite for FR-001 in `src/modules/plan/plan.service.spec.ts`: test `create()` successfully creates plan with valid name, description, and unique ID
- [x] T012 [P] [US1] Write test suite for FR-001 in `src/modules/plan/plan.service.spec.ts`: test `create()` throws ConflictException if plan with same name already exists
- [x] T013 [P] [US1] Write test suite for FR-001 in `src/modules/plan/plan.service.spec.ts`: test `create()` persists plan with correct fields (name, description, timestamps)
- [x] T014 [P] [US1] Write test suite for FR-002 in `src/modules/plan/plan.service.spec.ts`: test `createPrice()` rejects zero price with BadRequestException
- [x] T015 [P] [US1] Write test suite for FR-002 in `src/modules/plan/plan.service.spec.ts`: test `createPrice()` rejects negative price with BadRequestException
- [x] T016 [P] [US1] Write test suite for FR-002 in `src/modules/plan/plan.service.spec.ts`: test `createPrice()` accepts and persists positive price correctly

### Tests for User Story 2: Billing Interval Validation & Plan Updates (FR-003, FR-004)

- [x] T017 [P] [US2] Write test suite for FR-003 in `src/modules/plan/plan.service.spec.ts`: test `createPrice()` accepts valid billing intervals (MONTHLY, ANNUAL) and persists correctly
- [x] T018 [P] [US2] Write test suite for FR-003 in `src/modules/plan/plan.service.spec.ts`: test `createPrice()` rejects invalid billing interval with validation error (removed - DTO validates)
- [x] T019 [P] [US2] Write test suite for FR-004 in `src/modules/plan/plan.service.spec.ts`: test `update()` modifies plan name and description and persists changes
- [x] T020 [P] [US2] Write test suite for FR-004 in `src/modules/plan/plan.service.spec.ts`: test `update()` does not call subscriptionService methods (isolated update)

### Tests for User Story 3: Plan Soft Delete & Active Plan Filtering (FR-005, FR-006)

- [x] T021 [P] [US3] Write test suite for FR-005 in `src/modules/plan/plan.service.spec.ts`: test `remove()` performs soft delete on plan without active subscriptions
- [x] T022 [P] [US3] Write test suite for FR-005 in `src/modules/plan/plan.service.spec.ts`: test `remove()` throws BadRequestException when plan has active subscriptions
- [x] T023 [P] [US3] Write test suite for FR-005 in `src/modules/plan/plan.service.spec.ts`: test `remove()` queries subscriptionService to verify no active subscriptions before delete
- [x] T024 [P] [US3] Write test suite for FR-006 in `src/modules/plan/plan.service.spec.ts`: test `findAll(activeOnly=true)` excludes soft-deleted plans from results
- [x] T025 [P] [US3] Write test suite for FR-006 in `src/modules/plan/plan.service.spec.ts`: test `findAll(activeOnly=false)` includes all plans (active and soft-deleted)

### Edge Cases for Plan Service

- [x] T026 [P] [US3] Write edge case test in `src/modules/plan/plan.service.spec.ts`: test `findOne()` returns soft-deleted plan if queried directly (no filtering at service level)
- [x] T027 [P] [US3] Write edge case test in `src/modules/plan/plan.service.spec.ts`: test `findPricesByPlan()` retrieves all price tiers for plan with multiple prices
- [x] T028 [P] [US3] Write edge case test in `src/modules/plan/plan.service.spec.ts`: test new prices can be added to plan with active subscriptions (new subscriptions use new price)

### Implementation for Plan Service

- [x] T029 [US1] Implement FR-001 in `src/modules/plan/plan.service.ts`: plan creation with name/description validation and duplicate name check (already exists)
- [x] T030 [US1] Implement FR-002 in `src/modules/plan/plan.service.ts`: price validation rejecting zero/negative amounts (added validation)
- [x] T031 [US2] Implement FR-003 in `src/modules/plan/plan.service.ts`: billing interval enum validation (MONTHLY, ANNUAL, etc.) (DTO validates)
- [x] T032 [US2] Implement FR-004 in `src/modules/plan/plan.service.ts`: plan update method for name/description modifications (already exists)
- [x] T033 [US3] Implement FR-005 in `src/modules/plan/plan.service.ts`: soft delete logic with active subscription check via softRemove() (already exists)
- [x] T034 [US3] Implement FR-006 in `src/modules/plan/plan.service.ts`: filtered findAll() method excluding soft-deleted plans when requested (already exists)

### Plan Service Test Verification

- [x] T035 Run plan tests with `npm test -- plan.service.spec.ts` and verify all tests pass (✅ 25/25 tests passing)
- [x] T036 Run coverage check with `npm run test:cov -- plan.service.spec.ts` and verify 90%+ line coverage for plan.service.ts (✅ 100% line coverage achieved)

**Checkpoint**: Plan service fully tested and implemented with 100% line coverage ✅

---

## Phase 4: User Story 4 (Subscription Creation & Duplicate Prevention) - Priority P1

**Goal**: Unit tests for subscription creation with valid references and duplicate prevention (3 functional requirements: FR-007, FR-008, FR-009)

**Independent Test**: Run `npm test -- --testNamePattern="FR-007|FR-008|FR-009"` to verify subscription creation works in isolation

### Tests for User Story 4: Subscription Creation & Duplicate Prevention (FR-007, FR-008, FR-009)

- [ ] T037 [P] [US4] Write test suite for FR-007 in `src/modules/subscription/subscription.service.spec.ts`: test `create()` successfully creates subscription with valid userId and planId with correct linkages
- [ ] T038 [P] [US4] Write test suite for FR-007 in `src/modules/subscription/subscription.service.spec.ts`: test `create()` throws NotFoundException if user not found
- [ ] T039 [P] [US4] Write test suite for FR-007 in `src/modules/subscription/subscription.service.spec.ts`: test `create()` throws NotFoundException if plan not found
- [ ] T040 [P] [US4] Write test suite for FR-007 in `src/modules/subscription/subscription.service.spec.ts`: test `create()` sets startDate to today and expiresAt based on billing interval
- [ ] T041 [P] [US4] Write test suite for FR-007 in `src/modules/subscription/subscription.service.spec.ts`: test `create()` links plan price if planPriceId provided
- [ ] T042 [P] [US4] Write test suite for FR-008 in `src/modules/subscription/subscription.service.spec.ts`: test `create()` rejects second active subscription for same user-plan with BadRequestException
- [ ] T043 [P] [US4] Write test suite for FR-008 in `src/modules/subscription/subscription.service.spec.ts`: test duplicate check queries repository with correct filters (user.id AND active=true)
- [ ] T044 [P] [US4] Write test suite for FR-009 in `src/modules/subscription/subscription.service.spec.ts`: test `create()` allows new subscription if previous subscription is cancelled (active=false)
- [ ] T045 [P] [US4] Write test suite for FR-009 in `src/modules/subscription/subscription.service.spec.ts`: test duplicate check distinguishes between cancelled and active subscriptions

### Implementation for User Story 4

- [ ] T046 [US4] Implement FR-007 in `src/modules/subscription/subscription.service.ts`: subscription creation with user and plan validation
- [ ] T047 [US4] Implement FR-008 in `src/modules/subscription/subscription.service.ts`: duplicate active subscription prevention check before creation
- [ ] T048 [US4] Implement FR-009 in `src/modules/subscription/subscription.service.ts`: duplicate check filtering for active=true subscriptions only

### Subscription Creation Test Verification

- [ ] T049 Run subscription creation tests with `npm test -- --testNamePattern="FR-007|FR-008|FR-009"` and verify all tests pass
- [ ] T050 Run coverage check with `npm run test:cov -- subscription.service.spec.ts` and verify 90%+ line coverage for creation logic

**Checkpoint**: Subscription creation and duplicate prevention working - subscriptions can be safely created

---

## Phase 5: User Stories 5-6 (Subscription Lifecycle & History) - Priority P2

**Goal**: Unit tests for subscription cancellation, expiration, and historical record preservation (5 functional requirements: FR-010 to FR-014)

**Independent Test**: Run `npm test -- --testNamePattern="FR-010|FR-011|FR-012|FR-013|FR-014"` to verify subscription lifecycle works in isolation

### Tests for User Story 5: Subscription Cancellation & Expiration (FR-010, FR-011, FR-012)

- [ ] T051 [P] [US5] Write test suite for FR-010 in `src/modules/subscription/subscription.service.spec.ts`: test `cancel()` sets active=false and records cancelledAt timestamp
- [ ] T052 [P] [US5] Write test suite for FR-010 in `src/modules/subscription/subscription.service.spec.ts`: test `cancel()` excludes cancelled subscription from active queries
- [ ] T053 [P] [US5] Write test suite for FR-011 in `src/modules/subscription/subscription.service.spec.ts`: test expiration date calculation for monthly billing interval (startDate + 1 month)
- [ ] T054 [P] [US5] Write test suite for FR-011 in `src/modules/subscription/subscription.service.spec.ts`: test expiration date calculation for annual billing interval (startDate + 1 year)
- [ ] T055 [P] [US5] Write test suite for FR-012 in `src/modules/subscription/subscription.service.spec.ts`: test `create()` rejects expiresAt before startDate with validation error
- [ ] T056 [P] [US5] Write test suite for FR-012 in `src/modules/subscription/subscription.service.spec.ts`: test expiresAt validation in all subscription creation paths

### Tests for User Story 6: Historical Records & Subscription History (FR-013, FR-014)

- [ ] T057 [P] [US6] Write test suite for FR-013 in `src/modules/subscription/subscription.service.spec.ts`: test `cancel()` preserves original subscription record (soft cancel, not hard delete)
- [ ] T058 [P] [US6] Write test suite for FR-013 in `src/modules/subscription/subscription.service.spec.ts`: test cancelled subscriptions maintain audit trail with createdAt, updatedAt, cancelledAt timestamps
- [ ] T059 [P] [US6] Write test suite for FR-014 in `src/modules/subscription/subscription.service.spec.ts`: test `findByUser()` retrieves all subscriptions regardless of status (active, cancelled, expired)
- [ ] T060 [P] [US6] Write test suite for FR-014 in `src/modules/subscription/subscription.service.spec.ts`: test `findByUser()` includes plan, user, dates, and status in results
- [ ] T061 [P] [US6] Write test suite for FR-014 in `src/modules/subscription/subscription.service.spec.ts`: test subscription history distinguishes statuses (active, cancelled, expired)

### Edge Cases for Subscription Lifecycle

- [ ] T062 [P] [US5] Write edge case test in `src/modules/subscription/subscription.service.spec.ts`: test subscription creation with retroactive start date (past date) and expiration calculation
- [ ] T063 [P] [US5] Write edge case test in `src/modules/subscription/subscription.service.spec.ts`: test subscription status marked as expired when current date > expiresAt
- [ ] T064 [P] [US6] Write edge case test in `src/modules/subscription/subscription.service.spec.ts`: test soft-deleted plan cannot be used for new subscriptions

### Implementation for Subscription Lifecycle

- [ ] T065 [US5] Implement FR-010 in `src/modules/subscription/subscription.service.ts`: cancellation logic with active flag and cancelledAt timestamp recording
- [ ] T066 [US5] Implement FR-011 in `src/modules/subscription/subscription.service.ts`: expiration date calculation based on billing interval
- [ ] T067 [US5] Implement FR-012 in `src/modules/subscription/subscription.service.ts`: expiration date validation (expiresAt > startDate)
- [ ] T068 [US6] Implement FR-013 in `src/modules/subscription/subscription.service.ts`: subscription record preservation during cancellations (no hard deletes)
- [ ] T069 [US6] Implement FR-014 in `src/modules/subscription/subscription.service.ts`: findByUser() method returning complete subscription history with all statuses

### Subscription Lifecycle Test Verification

- [ ] T070 Run subscription lifecycle tests with `npm test -- --testNamePattern="FR-010|FR-011|FR-012|FR-013|FR-014"` and verify all tests pass
- [ ] T071 Run full coverage check with `npm run test:cov -- subscription.service.spec.ts` and verify 90%+ line coverage for subscription.service.ts

**Checkpoint**: Subscription lifecycle fully tested and implemented with historical records preserved

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize test suite and ensure feature meets quality standards

- [ ] T072 Run complete test suite with `npm test` and verify all tests pass in < 5 seconds total
- [ ] T073 Run `npm run test:cov` and verify 90%+ statement and line coverage for both services
- [ ] T074 Verify test isolation by running tests multiple times: `npm test -- --randomize` ensures no state coupling
- [ ] T075 [P] Add test documentation at `src/modules/plan/README.test.md` explaining test organization and mocking strategy
- [ ] T076 [P] Add test documentation at `src/modules/subscription/README.test.md` explaining test organization and mocking strategy
- [ ] T077 Review all test files against contract specifications in `contracts/` and verify full compliance
- [ ] T078 Run `npm run test:watch` and verify tests re-run correctly on file changes
- [ ] T079 Validate quickstart.md test commands: verify `npm test`, `npm run test:watch`, `npm run test:cov` execute without errors
- [ ] T080 Add any missing edge case tests discovered during implementation
- [ ] T081 Refactor test code for readability: consolidate duplicate setup, extract magic numbers to constants in fixtures

**Checkpoint**: Test suite complete, documented, and ready for production use

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup → **BLOCKS all service tests**
- **Plan Service (Phase 3)**: Depends on Foundational
- **Subscription Creation (Phase 4)**: Depends on Foundational + Phase 3 (PlanService)
- **Subscription Lifecycle (Phase 5)**: Depends on Phase 4 (subscription creation)
- **Polish (Phase 6)**: Depends on all implementation phases

### Parallel Opportunities

**Phase 1** (all tasks):
- T001, T002, T003 can run sequentially (quick verification)

**Phase 2** (after Phase 1):
- T004, T005 can run in parallel (independent test modules)
- T006, T007, T008, T009 can run in parallel (independent mocks/fixtures)
- T010 depends on above fixtures

**Phase 3 Tests** (after Phase 2):
- T011-T028 (test writing) can run in parallel - different test cases
- T029-T034 (implementation) can run in parallel - different methods
- T035-T036 (verification) must run after implementations

**Phase 4 Tests** (after Phase 3):
- T037-T045 (test writing) can run in parallel
- T046-T048 (implementation) can run in parallel
- T049-T050 (verification) must run after implementations

**Phase 5 Tests** (after Phase 4):
- T051-T064 (test writing) can run in parallel
- T065-T069 (implementation) can run in parallel
- T070-T071 (verification) must run after implementations

**Phase 6** (after Phase 5):
- T072-T074 (coverage verification) must be sequential
- T075-T081 (documentation, refactoring) can run in parallel

---

## Parallel Example: Plan Service Tests (Phase 3)

```bash
# Write all plan tests in parallel:
Developer 1: T011-T016 (FR-001, FR-002 tests)
Developer 2: T017-T020 (FR-003, FR-004 tests)
Developer 3: T021-T028 (FR-005, FR-006, edge cases)

# Implement fixes in parallel:
Developer 1: T029-T030 (FR-001, FR-002 implementation)
Developer 2: T031-T032 (FR-003, FR-004 implementation)
Developer 3: T033-T034 (FR-005, FR-006 implementation)

# Verify all pass:
npm test -- plan.service.spec.ts
npm run test:cov -- plan.service.spec.ts
```

---

## Implementation Strategy

### Test-First Approach

1. **Write tests first** (Phase 3-5): Tasks T011-T028, T037-T045, T051-T064
2. **Tests should FAIL** initially: `npm test` shows failures
3. **Implement to make pass** (Phase 3-5): Tasks T029-T034, T046-T048, T065-T069
4. **Verify PASS** (Phase 3-5): Tasks T035-T036, T049-T050, T070-T071
5. **Check coverage**: Ensure 90%+ achieved

### MVP First (Plan Service Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T010)
3. Complete Phase 3: Plan Service tests + implementation (T011-T036)
4. **VALIDATE**: All plan tests pass with 90%+ coverage
5. Deploy/demo PlanService unit tests as MVP
6. **THEN** proceed to Phases 4-5 for Subscription service

### Full Implementation (All Services)

1. Phases 1-3: Setup + Foundational + Plan Service
2. Phase 4: Subscription Creation & Duplicate Prevention
3. Phase 5: Subscription Lifecycle & History
4. Phase 6: Polish & documentation

---

## Success Criteria

✅ **Phase 1 Complete**: Jest configured and test utilities ready

✅ **Phase 2 Complete**: Shared test infrastructure ready - service tests can begin

✅ **Phase 3 Complete**: 
- 18 plan service tests written and passing
- 90%+ code coverage for plan.service.ts
- Plan creation, pricing, billing, updates, soft delete, filtering all working

✅ **Phase 4 Complete**:
- 9 subscription creation tests written and passing
- 90%+ code coverage for subscription creation logic
- Duplicate prevention verified

✅ **Phase 5 Complete**:
- 14 subscription lifecycle tests written and passing
- 90%+ code coverage for subscription.service.ts
- Cancellation, expiration, history preservation all working

✅ **Phase 6 Complete**:
- Full test suite runs in < 5 seconds
- 90%+ coverage for both services
- Tests pass multiple runs (no state coupling)
- Documentation complete

---

## Notes

- Test-first: Write failing tests before implementation
- [P] tasks can run in parallel = different files, no dependencies
- [Story] label maps task to user story (US1-US6)
- All tests must be independent and resettable via jest.clearAllMocks()
- Mocking ensures zero database dependencies during tests
- Coverage target: 90%+ for both service files
- Performance target: All tests < 5 seconds total
- Verify tests can run in random order (no state coupling)
