// ***********************************************
// Custom Cypress Commands
// ***********************************************

/// <reference types="cypress" />

// Type definitions
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  name: string;
  phoneNumber: string;
}

interface LoginResponse {
  token: string;
}

// API Base URL from Cypress environment (localhost:8080 for testing)
// This should NEVER point to the production Azure backend
const getApiUrl = (): string => Cypress.env('API_BASE_URL') || 'http://localhost:8080';

// Default test user credentials (from DatabaseSeeder)
// These match the users seeded in the database
const DEFAULT_TEST_USER = {
  email: 'john.smith@example.com',
  password: 'password123',
};

// ============================================
// LOGIN COMMAND
// Uses seeded test user from DatabaseSeeder by default
// Default: john.smith@example.com / password123
// ============================================
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const userEmail = email || DEFAULT_TEST_USER.email;
  const userPassword = password || DEFAULT_TEST_USER.password;

  cy.log(`Logging in as ${userEmail}`);

  cy.request({
    method: 'POST',
    url: `${getApiUrl()}/auth/login`,
    body: {
      email: userEmail,
      password: userPassword,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    const { token } = response.body as LoginResponse;

    // Store token and email in localStorage (mimicking AsyncStorage for web)
    window.localStorage.setItem('auth_token', token);
    window.localStorage.setItem('auth_email', userEmail);

    cy.log('Login successful');
  });
});

// ============================================
// REGISTER COMMAND
// ============================================
Cypress.Commands.add('register', (userData: RegisterData) => {
  cy.log(`Registering user ${userData.email}`);

  cy.request({
    method: 'POST',
    url: `${getApiUrl()}/users/register`,
    body: userData,
    headers: {
      'Content-Type': 'application/json',
    },
    failOnStatusCode: false, // Don't fail if user already exists
  }).then((response) => {
    if (response.status === 200 || response.status === 201) {
      cy.log('Registration successful');
    } else if (response.status === 400 && response.body?.message?.includes('already exists')) {
      cy.log('User already exists, proceeding...');
    } else {
      cy.log(`Registration response: ${response.status}`);
    }
  });
});

// ============================================
// LOGOUT COMMAND
// ============================================
Cypress.Commands.add('logout', () => {
  cy.log('Logging out');
  window.localStorage.removeItem('auth_token');
  window.localStorage.removeItem('auth_email');
  cy.clearCookies();
  cy.clearLocalStorage();
});

// ============================================
// RESET DATABASE COMMAND
// Calls backend /test/reset-database endpoint
// This drops all collections and reseeds with DatabaseSeeder data
// ============================================
Cypress.Commands.add('resetDatabase', () => {
  cy.log('Resetting test database and reseeding with DatabaseSeeder data');
  cy.task('resetDatabase').then((result) => {
    if (result) {
      cy.log('Database reset and reseeded successfully');
    } else {
      cy.log('Database reset skipped (endpoint not available - make sure backend runs with dev profile)');
    }
  });
});

// ============================================
// SEED TEST DATA COMMAND
// ============================================
Cypress.Commands.add('seedTestData', (type: string) => {
  cy.log(`Seeding test data: ${type}`);
  cy.task('seedTestData', { type }).then((result) => {
    if (result) {
      cy.log('Test data seeded successfully');
    } else {
      cy.log('Seeding skipped (endpoint not available)');
    }
  });
});

// ============================================
// CLEANUP TEST DATA COMMAND
// Removes users created during tests
// ============================================
Cypress.Commands.add('cleanupTestData', () => {
  cy.log('Cleaning up test-created data');
  cy.task('cleanupTestData').then((result) => {
    if (result) {
      cy.log('Test data cleaned up successfully');
    } else {
      cy.log('Cleanup skipped (endpoint not available)');
    }
  });
});

// ============================================
// GET BY TEST ID COMMAND
// ============================================
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// ============================================
// WAIT FOR API COMMAND
// ============================================
Cypress.Commands.add('waitForApi', (endpoint: string) => {
  // Create a clean alias name from the endpoint
  const aliasName = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
  cy.intercept('*', `**${endpoint}**`).as(aliasName);
  cy.wait(`@${aliasName}`, { timeout: 10000 });
});

export {};
