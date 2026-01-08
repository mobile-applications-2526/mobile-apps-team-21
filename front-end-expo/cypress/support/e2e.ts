// ***********************************************************
// This file is processed and loaded automatically before your test files.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Type definitions
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  name: string;
  phoneNumber: string;
}

// Prevent TypeScript errors for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via API and store token
       * @example cy.login('email@example.com', 'password123')
       */
      login(email?: string, password?: string): Chainable<void>;
      
      /**
       * Custom command to register a new user via API
       * @example cy.register({ email: 'test@example.com', password: 'Test123!', ... })
       */
      register(userData: RegisterData): Chainable<void>;
      
      /**
       * Custom command to logout and clear auth state
       * @example cy.logout()
       */
      logout(): Chainable<void>;
      
      /**
       * Custom command to reset the test database and reseed with DatabaseSeeder data
       * @example cy.resetDatabase()
       */
      resetDatabase(): Chainable<void>;
      
      /**
       * Custom command to seed test data
       * @example cy.seedTestData('users')
       */
      seedTestData(type: string): Chainable<void>;
      
      /**
       * Custom command to cleanup test-created data (users with test patterns)
       * @example cy.cleanupTestData()
       */
      cleanupTestData(): Chainable<void>;
      
      /**
       * Custom command to get element by data-testid
       * @example cy.getByTestId('login-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Custom command to wait for API request to complete
       * @example cy.waitForApi('/auth/login')
       */
      waitForApi(endpoint: string): Chainable<void>;
      
      /**
       * Custom command to click on a tab in the tab bar
       * (avoids clicking headers with same text)
       * @example cy.clickTab('Discover')
       */
      clickTab(tabName: string): Chainable<void>;
      
      /**
       * Custom command to type in a React Native Web input reliably
       * Handles headless mode by clicking to focus first
       * @example cy.typeInInput('input[placeholder="email"]', 'test@test.com')
       */
      typeInInput(selector: string, text: string): Chainable<void>;
    }
  }
}

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // Returning false prevents Cypress from failing the test
  // React Native Web may throw some benign errors
  if (err.message.includes('ResizeObserver') || 
      err.message.includes('__DEV__') ||
      err.message.includes('Cannot read properties of null')) {
    return false;
  }
  return true;
});

// Before each test, set up the API intercepts
beforeEach(() => {
  // Intercept API calls for debugging
  cy.intercept('POST', '**/auth/login').as('loginRequest');
  cy.intercept('POST', '**/users/register').as('registerRequest');
  cy.intercept('GET', '**/users**').as('getUserRequest');
  cy.intercept('POST', '**/test/reset-database').as('resetDatabaseRequest');
  cy.intercept('POST', '**/test/seed').as('seedRequest');
});

export {};
