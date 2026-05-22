# Quickstart: Running Unit Tests

**Feature**: Unit Tests for Plan and Subscription Services

## Prerequisites

- Node.js 18+ with npm/pnpm
- Repository cloned with dependencies installed: `pnpm install`
- TypeScript compiled: `npm run build` (optional for watch mode)

## Running Tests

### Run All Tests
```bash
npm test
```
Executes all `.spec.ts` files once. Typically completes in 1-2 seconds.

### Run Tests in Watch Mode
```bash
npm run test:watch
```
Re-runs tests on file changes. Press `q` to quit. Ideal for development.

### Run Tests with Coverage Report
```bash
npm run test:cov
```
Generates coverage report in console and HTML report in `coverage/` directory.
Opens browser report: `coverage/lcov-report/index.html`

### Run Specific Test Suite
```bash
npm test -- plan.service.spec.ts
```
Runs only the Plan service tests.

```bash
npm test -- subscription.service.spec.ts
```
Runs only the Subscription service tests.

### Run Tests in Debug Mode
```bash
npm run test:debug
```
Launches with Node debugger. Open `chrome://inspect` in Chrome to debug.
Set breakpoints in test files directly.

### Run Tests with Specific Pattern
```bash
npm test -- --testNamePattern="should create plan successfully"
```
Runs only tests matching the pattern.

## Test Files Location

```
src/modules/
├── plan/
│   └── plan.service.spec.ts          # PlanService tests (to be completed)
│
└── subscription/
    └── subscription.service.spec.ts   # SubscriptionService tests (to be completed)
```

## Test Structure Example

Each test file follows this organization:

```typescript
describe('PlanService', () => {
  let service: PlanService;
  let mockPlanRepository;
  let mockSubscriptionService;

  beforeEach(async () => {
    // Create test module with mocked dependencies
    const module = await Test.createTestingModule({...}).compile();
    service = module.get<PlanService>(PlanService);
    // Get mocks
    mockPlanRepository = module.get('PlanRepository');
  });

  describe('create', () => {
    it('should create plan successfully', async () => {
      // Arrange
      const createDto = { name: 'Test', description: 'Test plan' };
      
      // Act
      const result = await service.create(createDto);
      
      // Assert
      expect(result).toBeDefined();
    });

    it('should prevent invalid pricing', async () => {
      // Arrange
      const invalidDto = { price: -50 };
      
      // Act & Assert
      await expect(service.create(invalidDto)).rejects.toThrow();
    });
  });
});
```

## Understanding Mock Setup

### What Gets Mocked
- `Repository<Entity>` from TypeORM - prevents database access
- `PlanService` when testing `SubscriptionService` - isolates business logic
- `UserService` when testing subscriptions - eliminates external dependencies

### Why Mock
- **Speed**: Tests run without database I/O
- **Isolation**: Each test focuses on specific business logic
- **Reliability**: No flaky network or DB connection issues
- **Development**: Run tests locally without Docker/databases

### How to Mock
```typescript
// Mock a method to return a value
mockRepository.findOne.mockResolvedValue({ id: '1', name: 'Test' });

// Mock a method to throw an exception
mockRepository.save.mockRejectedValue(new Error('DB Error'));

// Verify a mock was called correctly
expect(mockRepository.save).toHaveBeenCalledWith(expectedData);
expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
```

## Coverage Goals

- **Target**: 90%+ statement coverage for both services
- **Current**: Varies (check with `npm run test:cov`)
- **Improvement**: Each test added increases coverage toward target

Check coverage report after running tests:
```
----------|----------|----------|----------|----------|------|
File      |  % Stmts | % Branch | % Funcs  | % Lines  |Uncov |
----------|----------|----------|----------|----------|------|
Services  |    85.2  |   78.3   |   90.1   |   84.9   |...   |
----------|----------|----------|----------|----------|------|
```

## Common Issues & Solutions

### "Cannot find module '@nestjs/testing'"
- Run: `pnpm install`
- Ensure @nestjs/testing is in package.json

### "Jest configuration not found"
- Run from project root: `npm test`
- jest.config.js should be at repository root

### "Timeout: test did not complete in 5000ms"
- Async tests missing `async` keyword: `it('name', async () => { ... })`
- Unresolved promises: ensure all async operations are awaited
- Forgot to return promise in test

### Tests pass locally but fail in CI
- Usually missing `beforeEach` setup
- Mocks not reset between tests (jest.clearAllMocks())
- Test order dependency (tests should be independent)

## Next Steps

1. **Complete Existing Specs**: 
   - `plan.service.spec.ts` - partially complete, add missing test cases
   - `subscription.service.spec.ts` - partially complete, add missing test cases

2. **Add New Test Cases**:
   - Follow patterns from existing tests
   - Map each FR from spec to at least one test
   - Include edge cases from spec

3. **Run Coverage Check**:
   - `npm run test:cov`
   - Target: 90%+ for both services
   - Add tests for uncovered lines

4. **Verify Mock Correctness**:
   - Mock method return types match entity interfaces
   - Jest mock calls match repository interface
   - No database access during test execution

## Test Execution CI/CD Integration

For continuous integration (GitHub Actions, GitLab CI, etc.):

```bash
# Run tests with coverage and fail if below threshold
npm run test:cov -- --coverage --coverageThreshold='{"global":{"lines":90}}'

# Run tests once and exit (non-watch mode)
npm test -- --testPathPattern=".spec.ts" --passWithNoTests
```

## Debugging Tips

1. **Add console.log statements**:
   ```typescript
   console.log('Mock repository called with:', mockRepository.findOne.mock.calls);
   ```

2. **Use Node debugger**:
   ```bash
   npm run test:debug -- plan.service.spec.ts
   ```
   Then open Chrome DevTools at `chrome://inspect`

3. **Run single test**:
   ```bash
   npm test -- -t "should create plan successfully"
   ```

4. **Check mock spy calls**:
   ```typescript
   expect(mockRepository.findOne).toHaveBeenCalled();
   expect(mockRepository.findOne).toHaveBeenCalledWith(expectedArgs);
   expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
   ```

## References

- Jest Documentation: https://jestjs.io/
- NestJS Testing: https://docs.nestjs.com/fundamentals/testing
- TypeORM Testing: https://typeorm.io/guides/advanced-installation-setup-options
- Package.json Test Scripts: See `npm test` command definitions
