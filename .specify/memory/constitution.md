# Subscription Management API Constitution

## Core Principles

### I. Layered Architecture

The project MUST maintain a strict layered architecture: **Controller → Service → TypeORM Repository → Database**. This separation ensures:
- Controllers remain thin; they MUST NOT contain business logic, only orchestration and HTTP concerns
- All business rules MUST live exclusively in the Service layer
- Repositories MUST provide data access only; no business logic filters in repository methods
- Direct database queries MUST NOT bypass the service layer
- Each layer has a single responsibility; crossing layers violates this principle

**Custom Repository Abstractions**: Do NOT create custom repository wrapper patterns unless concrete complexity justifies it (documented in architecture decision record). TypeORM repositories MUST be used directly via NestJS dependency injection.

### II. Service-Centric Business Logic

All domain business rules MUST be implemented in service classes. Controllers MUST delegate immediately to services. This principle ensures:
- Business logic is testable in isolation without HTTP context
- Rules remain reusable across multiple endpoints or future event handlers
- Services become the single source of truth for business behavior
- Validation MUST occur in services, not controllers

### III. Test-Driven Development (NON-NEGOTIABLE)

Unit tests are mandatory for all service-layer business logic. This principle is non-negotiable and supersedes schedule pressure:
- **Mocking Requirements**: Unit tests MUST mock all repositories and external dependencies; NO database connections allowed during tests
- **Test Scope**: Focus on validating business behavior (requirements from specification), not implementation details
- **Critical Rules**: Every business rule in the specification MUST have corresponding automated test coverage with minimum 90% line coverage
- **Test Execution**: All unit tests MUST execute in under 5 seconds; tests must be independent and executable in any order
- **Repository Isolation**: Tests MUST verify service behavior against mocked repository interfaces

### IV. Specification-Driven Development

All significant features MUST follow this workflow before implementation:
1. Create specification documenting user scenarios, requirements, and acceptance criteria
2. Generate implementation plan with architecture and design decisions
3. Decompose plan into dependency-ordered tasks
4. Implement and test based on specification
5. AI-generated code MUST be manually reviewed before acceptance

Specifications are non-negotiable governance documents; implementations MUST comply with their requirements.

### V. Domain Language Precision

The official domain entities are: **User, Plan, PlanPrice, Subscription**. This precision ensures clarity:
- The term "Customer" MUST NEVER appear in specifications, plans, tasks, or generated code
- Entity names MUST match the official domain language exactly
- Domain modeling decisions are non-negotiable; ambiguity creates implementation errors
- All artifacts (specifications, code, documentation) MUST use precise terminology

### VI. Modular Boundaries & Minimal Abstractions

The project is organized by domain modules (auth, plan, subscription, user, etc.). This principle ensures:
- Module boundaries MUST be respected; cross-module dependencies MUST be explicit via dependency injection
- Shared abstractions SHOULD be minimal; each module owns its core logic
- Controllers and services MUST remain within their module except through explicit service injection
- Avoid "helpers" or "utils" directories that diffuse responsibility; logic stays with domain owners

### VII. AI-Assisted Development with Manual Governance

The project uses AI agents for specification, planning, and task generation. However:
- All AI-generated code MUST be manually reviewed and approved before acceptance
- Complexity MUST be explicitly justified before introduction; no unnecessary abstractions
- Constitution rules override ad-hoc decisions; governance decisions take precedence
- Development MUST maintain human oversight; AI is a tool, not autonomous decision-maker

## Architecture & Technical Standards

**Technology Stack**:
- Framework: NestJS 11.0+ with TypeScript
- Database: PostgreSQL with TypeORM ORM
- Testing: Jest with mocked dependencies
- Authentication: JWT with refresh token rotation
- Authorization: Role-based access control (RBAC)

**Technical Requirements**:
- **DTOs**: Data transfer objects are MANDATORY for all controller endpoints; request validation is required
- **Dependency Injection**: Prefer NestJS DI for all service dependencies; constructor injection is the default pattern
- **Type Safety**: Explicit typing is MANDATORY; `any` types are prohibited except in approved exceptions
- **Error Handling**: Services MUST throw specific exception types (NotFoundException, BadRequestException, ConflictException, etc.); controllers translate to HTTP responses

**Database Interactions**:
- All database access MUST go through TypeORM repositories injected into services
- Soft deletes MUST be used for domain entities to preserve historical records
- Migrations MUST track schema changes; manual schema modifications are prohibited
- Database-level constraints are OPTIONAL; business logic enforcement in services is preferred

## Security & Data Governance

**Authentication & Authorization**:
- JWT tokens are required for authenticated endpoints
- Refresh token rotation MUST be implemented for extended sessions
- RBAC decorators MUST protect endpoints requiring specific roles
- Sensitive data (passwords, tokens) MUST NEVER be logged

**Data Preservation**:
- Historical records MUST be preserved; hard deletes are prohibited
- Soft deletion timestamps provide audit trails
- Subscription lifecycle changes MUST maintain complete history for billing reconciliation

## Development Workflow

**Feature Development Cycle**:
1. **Specification Phase**: Create spec.md with user scenarios, requirements, success criteria using Spec Kit
2. **Planning Phase**: Generate plan.md with technical design, research, data model, and test contracts
3. **Task Decomposition**: Generate tasks.md with dependency-ordered, prioritized implementation tasks
4. **Implementation**: Implement features task-by-task; AI may generate code but humans review and refactor
5. **Testing**: Implement tests according to test contracts; verify 90%+ coverage and specification compliance

**Code Review Gates**:
- AI-generated code MUST be reviewed for correctness, style, and architecture alignment before merge
- Pull requests MUST include test evidence (coverage reports, test execution results)
- Changes MUST NOT violate constitution principles; violations must be explicitly justified

**Future Architecture Evolution**:
- Event-driven workflows (async domain events)
- Queue-based background jobs (Bull/Redis)
- Multi-tenant architecture (isolated data per tenant)
- Billing provider integrations (Stripe, etc.)
- Audit logging (complete change history)
- These are planned; current implementation focuses on foundation

## Governance

**Constitution Authority**: This constitution supersedes all ad-hoc development decisions and style guides. All features, code changes, and architectural decisions MUST comply with these principles.

**Amendment Process**:
- Constitution changes require explicit documentation of rationale and impact
- Version changes follow semantic versioning (MAJOR: principle removals/redefinitions; MINOR: new principles/expanded guidance; PATCH: clarifications/wording)
- Amendments MUST be committed with clear change descriptions
- All affected templates and workflows MUST be updated after amendments

**Compliance Review**:
- New specifications and implementations MUST verify constitution compliance during planning phase (Constitution Check gate)
- Complexity justification is required before introducing new architectural patterns or abstractions
- Spec Kit templates (plan.md, tasks.md) include Constitution Check gates ensuring compliance before implementation

**Ratification & Amendment History**:
- **Version**: 1.0.0 | **Ratified**: 2026-05-22 | **Last Amended**: 2026-05-22
