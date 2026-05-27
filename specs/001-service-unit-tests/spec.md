# Feature Specification: Unit Tests for Plan and Subscription Services

**Feature Branch**: `001-service-unit-tests`

**Created**: May 22, 2026

**Status**: Draft

**Input**: User description: "Unit tests for Plan and Subscription services. Validate critical business rules from subscription lifecycle and plan management."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validate Plan Creation and Pricing Rules (Priority: P1)

Test engineers need to verify that PlanService correctly creates plans with valid pricing information and rejects invalid pricing configurations to prevent data corruption and billing errors.

**Why this priority**: Plan creation is foundational - without valid plans, the entire subscription system fails. Pricing validation directly impacts revenue accuracy.

**Independent Test**: Verify PlanService creates plans and validates pricing by running plan creation tests independently. Delivers validated data integrity for all downstream subscription operations.

**Acceptance Scenarios**:

1. **Given** a new plan with valid name, description, and pricing, **When** createPlan() is called, **Then** plan is saved with unique ID and all fields correctly persisted
2. **Given** a plan with invalid pricing (zero, negative, non-numeric), **When** createPlan() is called, **Then** operation fails with appropriate validation error
3. **Given** a plan with multiple price tiers, **When** prices are created, **Then** each tier stores interval and amount correctly

---

### User Story 2 - Validate Billing Interval and Plan Updates (Priority: P1)

Test engineers verify that billing intervals are correctly validated (monthly, annual, etc.) and that plan updates maintain data consistency while allowing necessary modifications.

**Why this priority**: Billing interval directly affects user billing schedules and financial reconciliation. Plan updates must be safe and traceable for operational reliability.

**Independent Test**: Test billing interval validation and plan updates independently. Ensures users are billed on correct schedules and plan modifications don't corrupt existing subscriptions.

**Acceptance Scenarios**:

1. **Given** a plan with valid billing interval (monthly, annual, etc.), **When** plan is created, **Then** interval is correctly stored and validated
2. **Given** an invalid billing interval value, **When** plan is created, **Then** validation fails with clear error message
3. **Given** an existing plan, **When** updatePlan() modifies name or description, **Then** changes persist without affecting associated subscriptions
4. **Given** a plan with existing subscriptions, **When** updatePlan() attempts to change pricing, **Then** change is applied only for new subscriptions

---

### User Story 3 - Validate Plan Soft Delete and Historical Record Keeping (Priority: P1)

Test engineers confirm that plan soft deletes preserve historical data for audit trails and reporting while preventing use of deleted plans for new subscriptions.

**Why this priority**: Soft deletes are critical for compliance, audit trails, and financial reconciliation. Hard deletes would corrupt historical records needed for user disputes and regulatory requirements.

**Independent Test**: Verify soft delete functionality independently. Ensures plans remain recoverable and historical subscriptions remain auditable.

**Acceptance Scenarios**:

1. **Given** an active plan, **When** softDeletePlan() is called, **Then** plan marked as deleted but not removed from database
2. **Given** a soft-deleted plan, **When** querying active plans, **Then** deleted plan is excluded from results
3. **Given** a soft-deleted plan, **When** historical query includes deletions, **Then** plan record is visible with deletion timestamp

---

### User Story 4 - Validate Subscription Creation and Duplicate Prevention (Priority: P1)

Test engineers verify that subscriptions are created correctly with proper user and plan linkage, and that duplicate active subscriptions are prevented to avoid overbilling and user confusion.

**Why this priority**: Duplicate subscriptions directly cause revenue leakage and user support issues. Subscription creation accuracy is foundational for all billing operations.

**Independent Test**: Test subscription creation and duplicate prevention independently. Delivers reliable subscription data that downstream payment processing depends on.

**Acceptance Scenarios**:

1. **Given** a user and active plan, **When** createSubscription() is called with valid data, **Then** subscription is created with unique ID and correct linkages
2. **Given** a user with existing active subscription to same plan, **When** createSubscription() is called again, **Then** operation fails with duplicate prevention error
3. **Given** a user with cancelled subscription to a plan, **When** createSubscription() is called for same plan, **Then** new subscription is allowed
4. **Given** a subscription creation request with invalid user or plan ID, **When** createSubscription() is called, **Then** operation fails with validation error

---

### User Story 5 - Validate Subscription Cancellation and Expiration Rules (Priority: P2)

Test engineers confirm that subscriptions can be properly cancelled and that expiration dates are correctly calculated and validated to ensure accurate subscription lifecycle tracking.

**Why this priority**: Cancellation and expiration directly affect revenue recognition and user service. Essential for user retention and churn analysis.

**Independent Test**: Test cancellation logic and expiration date validation independently. Ensures accurate subscription status tracking.

**Acceptance Scenarios**:

1. **Given** an active subscription, **When** cancelSubscription() is called, **Then** subscription status changes to cancelled with cancellation timestamp
2. **Given** a cancelled subscription, **When** querying active subscriptions, **Then** cancelled subscription is excluded
3. **Given** a subscription with start date and billing interval, **When** calculating expiration, **Then** next billing date is correctly computed
4. **Given** a subscription past expiration date, **When** status is queried, **Then** subscription is marked as expired
5. **Given** an expiration date before start date, **When** subscription is created, **Then** validation fails

---

### User Story 6 - Validate Historical Subscription Records (Priority: P2)

Test engineers verify that all historical subscription records are preserved during cancellations and updates to enable accurate user billing history and dispute resolution.

**Why this priority**: Historical records are critical for user support, financial audits, and dispute resolution. Data loss here causes user service failures and compliance violations.

**Independent Test**: Verify historical record preservation through subscription lifecycle changes. Enables comprehensive billing history queries.

**Acceptance Scenarios**:

1. **Given** an active subscription, **When** it is cancelled, **Then** original subscription record remains in history
2. **Given** cancelled subscriptions in history, **When** historical query is executed, **Then** all subscriptions (active and cancelled) are retrievable with status and timestamps
3. **Given** multiple subscription updates, **When** audit trail is reviewed, **Then** all changes with timestamps are visible

---

### Edge Cases

- What happens when creating a subscription for a soft-deleted plan?
- How does the system handle subscriptions with retroactive start dates?
- What occurs when a plan is updated while active subscriptions are being billed?
- How are concurrent subscription creation attempts for the same user handled?
- What is the behavior when retrieving subscriptions for a non-existent user?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: PlanService MUST successfully create plans with valid name, description, and pricing information
- **FR-002**: PlanService MUST validate that pricing values are positive numbers and reject zero or negative prices
- **FR-003**: PlanService MUST validate billing intervals against allowed values (monthly, annual, etc.)
- **FR-004**: PlanService MUST support updating plan metadata (name, description) without affecting existing subscriptions
- **FR-005**: PlanService MUST implement soft delete that marks plans as deleted without removing database records
- **FR-006**: PlanService MUST exclude soft-deleted plans from active plan queries
- **FR-007**: SubscriptionService MUST successfully create subscriptions with valid user ID and plan ID references
- **FR-008**: SubscriptionService MUST prevent creation of duplicate active subscriptions for same user-plan combination
- **FR-009**: SubscriptionService MUST allow new subscriptions only if no active subscription exists for that user-plan pair
- **FR-010**: SubscriptionService MUST support cancellation of active subscriptions with status change and timestamp recording
- **FR-011**: SubscriptionService MUST calculate subscription expiration dates correctly based on start date and billing interval
- **FR-012**: SubscriptionService MUST validate expiration dates are after subscription start dates
- **FR-013**: SubscriptionService MUST preserve all historical subscription records through cancellations and updates
- **FR-014**: SubscriptionService MUST retrieve complete subscription history including cancelled and expired subscriptions

### Key Entities

- **Plan**: Represents a subscription plan with name, description, pricing, and billing interval. Has multiple price tiers and can be soft-deleted.
- **PlanPrice**: Represents individual pricing tiers within a plan, storing billing interval and amount for each tier.
- **Subscription**: Represents a user's subscription to a plan, tracking status (active, cancelled, expired), dates, and historical records.
- **User**: Referenced entity representing the account holder; relationship ensures subscriptions are tied to valid users.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 Plan business rules (create, pricing validation, billing interval, update, soft delete, history query) have passing unit tests with minimum 90% code coverage
- **SC-002**: All 6 Subscription business rules (create, duplicate prevention, cancellation, expiration validation, history preservation, history query) have passing unit tests with minimum 90% code coverage
- **SC-003**: 100% of repositories are mocked with no database dependencies in unit tests
- **SC-004**: All tests execute in under 5 seconds total and can run independently in any order without state coupling
- **SC-005**: Future refactoring of service implementation can safely proceed with test suite as regression safety net

## Assumptions

- Jest is the selected test framework (already configured in project)
- Service layer will use dependency injection for repository mocking
- Repositories follow standard CRUD patterns and can be mocked without database
- Billing intervals are constrained to predefined enum values (monthly, annual, etc.)
- Soft delete implementation uses a `deletedAt` timestamp field for logical deletion
- Subscription status is managed via enum with values: active, cancelled, expired
- User entities already exist in the system and can be referenced by ID
- No external dependencies (payment processors, email services) are involved in these specific business rules
- Tests will be added to existing `.spec.ts` files or new test files in the same module directories
