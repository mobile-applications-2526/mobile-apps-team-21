# Cypress E2E Testing Guide

This document explains how to run and write E2E tests for the EatUp Expo application.

## Setup

### Prerequisites

1. **Cypress is already installed** in the project via npm.

2. **Install additional dev dependencies** for better TypeScript support:
   ```bash
   npm install --save-dev @types/node start-server-and-test
   ```

3. **Configure your `.env` file** for testing:
   ```env
   # Production API (don't use for testing!)
   EXPO_PUBLIC_API_URL=https://eatup-backend.azurewebsites.net
   
   # Cypress Test API (localhost)
   CYPRESS_BASE_URL=http://localhost:8080
   ```

### Backend Setup (Required)

The backend must be running locally with the **dev** profile to enable test endpoints:

```bash
cd back-end
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

This enables:
- Test database endpoints (`/test/reset-database`, `/test/seed`, `/test/cleanup`)
- Uses local MongoDB at `mongodb://localhost:27017/Eat-Up`

## Test Users (DatabaseSeeder)

The backend includes a `DatabaseSeeder` that populates the database with test data. These users are available after running `cy.resetDatabase()`:

| User | Email | Password |
|------|-------|----------|
| John Smith | john.smith@example.com | password123 |
| Jane Doe | jane.doe@example.com | password123 |
| Charlie Brown | charlie.brown@example.com | password123 |
| Emma Johnson | emma.johnson@example.com | password123 |
| Liam Miller | liam.miller@example.com | password123 |
| Olivia Davis | olivia.davis@example.com | password123 |

**Default Test User**: `john.smith@example.com` / `password123`

The seeder also creates:
- Groups (e.g., "Italian Lovers", "Weekend Foodies")
- Restaurants with menus
- Group visits and relationships

## Running Tests

### Option 1: Interactive Mode (Recommended for development)

1. Start your Expo web server:
   ```bash
   npm run web
   ```

2. In another terminal, open Cypress:
   ```bash
   npm run cypress:open
   ```

3. Select "E2E Testing" and choose a browser.

### Option 2: Headless Mode (For CI/CD)

Run all tests in headless mode:
```bash
npm run cypress:run
```

### Option 3: With Server Auto-Start

If you have `start-server-and-test` installed:
```bash
npm run test:e2e       # Headless
npm run test:e2e:open  # Interactive
```

## Test Structure

```
cypress/
├── e2e/                    # E2E test files
│   ├── login.cy.ts         # Login page tests
│   ├── register.cy.ts      # Register page tests
│   ├── navigation.cy.ts    # Tab navigation tests
│   └── auth-flow.cy.ts     # Complete auth flow tests
├── fixtures/               # Test data
│   └── users.json          # User test data
├── support/                # Support files
│   ├── commands.ts         # Custom Cypress commands
│   └── e2e.ts              # Setup file
└── tsconfig.json           # TypeScript config for Cypress
```

## Custom Commands

The following custom commands are available:

### `cy.login(email?, password?)`
Logs in a user via API and stores the token. Uses test user credentials by default.

```typescript
// Use default test user
cy.login();

// Use specific credentials
cy.login('user@example.com', 'password123');
```

### `cy.logout()`
Clears authentication state.

```typescript
cy.logout();
```

### `cy.register(userData)`
Registers a new user via API.

```typescript
cy.register({
  email: 'new@example.com',
  password: 'Pass123!',
  firstName: 'John',
  name: 'Doe',
  phoneNumber: '0470123456'
});
```

### `cy.getByTestId(testId)`
Gets an element by `data-testid` attribute.

```typescript
cy.getByTestId('login-button').click();
```

### `cy.resetDatabase()`
Resets the test database and reseeds with DatabaseSeeder data. 
Requires backend running with `dev` profile.

```typescript
// Usually in before() hook
before(() => {
  cy.resetDatabase();
});
```

### `cy.cleanupTestData()`
Removes users created during tests (users not in the original seed).

```typescript
// Usually in after() hook
after(() => {
  cy.cleanupTestData();
});
```

### `cy.seedTestData(type)`
Seeds specific test data (users, groups, restaurants).

```typescript
cy.seedTestData('users');
```

## Test Environment

### Environment Variables

Configure in `cypress.config.ts`:

```typescript
env: {
  API_BASE_URL: 'http://localhost:8080',
  // Seeded user from DatabaseSeeder
  TEST_USER_EMAIL: 'john.smith@example.com',
  TEST_USER_PASSWORD: 'password123',
}
```

### Database Reset & Seeding

Tests automatically reset and reseed the database using the backend's `TestController`:

```typescript
describe('My Tests', () => {
  before(() => {
    // Reset DB and run DatabaseSeeder before all tests
    cy.resetDatabase();
  });

  after(() => {
    // Optional: cleanup test-created users
    cy.cleanupTestData();
  });
});
```

### Using Test Database

For tests that modify data, you should:

1. Run your backend locally with `dev` profile and local MongoDB
2. Use `cy.resetDatabase()` in `before()` hook to ensure seeded data
3. Use `cy.cleanupTestData()` in `after()` hook to remove test-created users
4. Or use unique data for each test (e.g., unique emails with timestamps)

## Writing New Tests

### Basic Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    cy.logout();
    cy.visit('/page');
  });

  it('should do something', () => {
    // Test steps
    cy.get('input').type('value');
    cy.contains('button', 'Submit').click();
    cy.url().should('include', '/expected-path');
  });
});
```

### Best Practices

1. **Use selectors wisely**: Prefer `data-testid` > role > text content > CSS classes
2. **Wait for elements**: Use Cypress's built-in retry mechanism
3. **Isolate tests**: Each test should be independent
4. **Use fixtures**: Store test data in `fixtures/` folder
5. **Mock API when needed**: Use `cy.intercept()` for controlled responses

### Testing Authenticated Pages

```typescript
describe('Protected Page', () => {
  beforeEach(() => {
    cy.login(); // Login via API
    cy.visit('/protected-page');
  });

  it('should show content', () => {
    cy.contains('Protected Content').should('be.visible');
  });
});
```

### Testing Form Validation

```typescript
it('should show validation error', () => {
  cy.get('input[placeholder="email"]').clear();
  cy.contains('button', 'Submit').click();
  cy.contains('Email is required').should('be.visible');
});
```

### Mocking API Responses

```typescript
it('should handle API error', () => {
  cy.intercept('POST', '**/api/endpoint', {
    statusCode: 500,
    body: { message: 'Server error' }
  }).as('apiError');

  cy.get('button').click();
  cy.wait('@apiError');
  cy.contains('Server error').should('be.visible');
});
```

## Adding Test IDs to Components

To make testing easier, add `testID` props to your React Native components:

```tsx
// In your component
<TouchableOpacity 
  testID="login-button"
  onPress={handleLogin}
>
  <Text>Login</Text>
</TouchableOpacity>
```

Then select in tests:
```typescript
cy.getByTestId('login-button').click();
```

## Backend Test Endpoints

The backend includes a `TestController` that provides database management endpoints for testing. These are only available when running with the `dev` or `test` profile.

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/test/health` | GET | Health check for test endpoints |
| `/test/reset-database` | POST | Drops all collections and reseeds with DatabaseSeeder data |
| `/test/seed` | POST | Seeds specific data type (users, groups, restaurants, etc.) |
| `/test/cleanup` | POST | Removes users created during tests |

### Running Backend for Testing

```bash
cd back-end
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Configuration (application-dev.properties)

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/Eat-Up
spring.profiles.active=dev
```

### Example TestController

```java
@RestController
@RequestMapping("/test")
@Profile({"dev", "test"})
public class TestController {
    
    @PostMapping("/reset-database")
    public ResponseEntity<?> resetDatabase() {
        // Drops all collections and runs DatabaseSeeder
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/seed")
    public ResponseEntity<?> seedData(@RequestBody Map<String, String> request) {
        String type = request.get("type");
        // Seeds specific data (users, groups, restaurants, etc.)
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/cleanup")
    public ResponseEntity<?> cleanup() {
        // Removes test-created users
        return ResponseEntity.ok().build();
    }
}
```

## Troubleshooting

### Tests timeout
- Increase timeout in `cypress.config.ts`
- Check if backend is running
- Check network requests in Cypress UI

### Element not found
- Check if element exists in DOM
- Add appropriate waits
- Verify selectors

### Auth issues
- Check localStorage in browser
- Verify token format
- Check backend auth endpoints

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run web &
      - run: npx wait-on http://localhost:8081
      - run: npm run cypress:run
```
