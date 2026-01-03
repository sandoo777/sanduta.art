# Test Coverage Documentation

## Overview
This document describes the test suite setup and coverage for the sanduta.art e-commerce application.

## Test Framework
- **Framework**: Vitest v4.0.16
- **Environment**: happy-dom (lightweight DOM implementation)
- **UI**: @vitest/ui for visual test exploration
- **Test Library**: @testing-library/react for component testing

## Test Configuration

**File**: `vitest.config.ts`

```typescript
- Environment: happy-dom
- Globals enabled for describe, it, expect
- Setup file: src/__tests__/setup.ts
- Coverage: v8 provider with text, json, html reporters
```

## Test Commands

```bash
npm test              # Run tests in watch mode
npm test -- --run     # Run tests once (CI mode)
npm run test:ui       # Open Vitest UI
npm run test:coverage # Generate coverage report
```

## Test Suites

### 1. Validation Functions (`validation.test.ts`)
**Coverage**: 19 tests ✓

Tests for form validation utilities:

- **validateEmail**: 6 tests
  - Valid email formats (user@example.com, test.user@domain.co.uk)
  - Invalid formats (missing @, no domain, spaces)
  
- **validatePhone**: 7 tests
  - International formats (+380501234567, +1 (555) 123-4567)
  - Minimum 10 digits requirement
  - Handles spaces and special characters
  
- **validateAddress**: 6 tests
  - Minimum 5 characters after trim
  - Whitespace handling
  - Edge cases
  
- **validateCustomerName**: 6 tests
  - Minimum 2 characters
  - Unicode support (Cyrillic names)
  - Whitespace trimming
  
- **validateCheckoutForm**: 8 tests
  - Complete form validation
  - Multiple field errors
  - Conditional address validation (home vs pickup)

### 2. Paynet Client (`paynet.test.ts`)
**Coverage**: 12 tests ✓

Tests for payment gateway integration:

- **generateSignature**: 4 tests
  - HMAC SHA256 signature generation
  - Consistent signatures for same data
  - Different signatures for different data
  - JSON payload handling
  
- **verifyWebhook**: 5 tests
  - Valid signature verification
  - Invalid signature rejection
  - Tampered data detection
  - Empty body handling
  - Case sensitivity
  
- **Security**: 3 tests
  - Cryptographic strength (hexadecimal format)
  - Secret not exposed in signature
  - Special characters and Unicode handling

### 3. Nova Poshta Client (`novaposhta.test.ts`)
**Coverage**: 17 tests ✓

Tests for delivery service integration:

- **searchCities**: 6 tests
  - City name matching
  - Minimum 2 character requirement
  - Case-insensitive search
  - Ukrainian and Russian name support
  - Partial match handling
  
- **getPickupPoints**: 3 tests
  - Valid city reference handling
  - Error for empty reference
  - Warehouse information structure
  
- **validateTrackingNumber**: 6 tests
  - 14-digit format validation
  - Length validation
  - Numeric-only requirement
  - No spaces/special characters
  
- **API Response Handling**: 2 tests
  - Successful responses
  - Empty results for no matches

## Test Results

```
✓ src/__tests__/novaposhta.test.ts (17 tests) 10ms
✓ src/__tests__/validation.test.ts (19 tests) 8ms
✓ src/__tests__/paynet.test.ts (12 tests) 7ms

Test Files  3 passed (3)
     Tests  48 passed (48)
  Duration  1.38s
```

## Continuous Integration

**File**: `.github/workflows/ci.yml`

### CI Pipeline
- **Trigger**: Push to main/develop, Pull requests
- **Jobs**: 
  1. **test**: Run test suite
  2. **build**: Build production bundle
  
### Test Job Steps:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies (`npm ci`)
4. Generate Prisma client
5. Run tests with environment variables
6. Run linter (continue on error)

### Build Job Steps:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Generate Prisma client
5. Build production bundle

### Environment Variables:
```yaml
NODE_ENV: test
DATABASE_URL: postgresql://test:test@localhost:5432/test
NEXTAUTH_SECRET: test-secret-key-for-ci-testing-only
NEXTAUTH_URL: http://localhost:3000
```

## Coverage Areas

### Tested ✅
- ✅ Email validation (6 test cases)
- ✅ Phone validation (7 test cases)
- ✅ Address validation (6 test cases)
- ✅ Customer name validation (6 test cases)
- ✅ Checkout form validation (8 test cases)
- ✅ Paynet signature generation and verification (12 test cases)
- ✅ Nova Poshta city search (6 test cases)
- ✅ Nova Poshta pickup points (3 test cases)
- ✅ Nova Poshta tracking number validation (6 test cases)

### Not Tested (Future Work)
- ⏳ API route handlers
- ⏳ React component rendering
- ⏳ Database operations (Prisma queries)
- ⏳ Email sending functionality
- ⏳ Cart context operations
- ⏳ Authentication flows
- ⏳ Integration tests (E2E)

## Running Tests Locally

### Prerequisites
```bash
npm install
```

### Run All Tests
```bash
npm test -- --run
```

### Run Specific Test File
```bash
npm test -- src/__tests__/validation.test.ts --run
```

### Generate Coverage Report
```bash
npm run test:coverage
```

Coverage report will be in `coverage/` directory:
- `coverage/index.html` - Interactive HTML report
- `coverage/coverage-final.json` - JSON data

### Watch Mode
```bash
npm test
```
Tests will re-run on file changes.

### Vitest UI
```bash
npm run test:ui
```
Opens interactive UI at http://localhost:51204/

## Best Practices

### Test Structure
```typescript
describe('ComponentOrFunction', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test-data';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### Assertions
- Use descriptive test names
- Test both success and failure cases
- Test edge cases (empty strings, null, undefined)
- Test boundary conditions
- Use specific matchers (toBe, toEqual, toHaveLength, etc.)

### Mocking
- Mock external dependencies (fetch, crypto)
- Use vi.fn() for function mocks
- Use vi.mock() for module mocks
- Clean up mocks in beforeEach/afterEach

## Future Improvements

1. **Increase Coverage**:
   - Add component tests for React components
   - Add API route integration tests
   - Add database operation tests

2. **E2E Testing**:
   - Add Playwright or Cypress for E2E tests
   - Test critical user flows (checkout, payment, registration)

3. **Performance Testing**:
   - Add benchmark tests for critical functions
   - Monitor test execution time

4. **Visual Regression**:
   - Add visual regression tests for UI components
   - Use tools like Percy or Chromatic

5. **Coverage Goals**:
   - Target 80%+ code coverage
   - 100% coverage for critical paths (payment, validation)

## Troubleshooting

### Tests Not Running
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Import Errors
```bash
# Ensure Prisma client is generated
npx prisma generate
```

### CI Failures
- Check GitHub Actions logs
- Verify environment variables are set
- Ensure Node.js version matches (20.x)

## Related Files

- `vitest.config.ts` - Vitest configuration
- `src/__tests__/setup.ts` - Test setup file
- `src/__tests__/*.test.ts` - Test files
- `.github/workflows/ci.yml` - CI pipeline
- `package.json` - Test scripts

## Maintenance

- Update tests when adding new features
- Review failing tests immediately
- Keep test coverage above 70%
- Run tests before committing code
- Update this documentation when adding new test suites
