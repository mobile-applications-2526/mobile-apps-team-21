/**
 * Register Page E2E Tests
 *
 * Note: Tests that create new users will use cleanup to remove
 * test-created users and avoid polluting the database.
 */

describe('Register Page', () => {
  before(() => {
    cy.resetDatabase();
  });

  after(() => {
    cy.cleanupTestData();
  });

  beforeEach(() => {
    cy.logout();
    cy.visit('/register');
  });

  describe('Form Validation', () => {
    it('should show error when required fields are empty', () => {
      fillFormExcept('firstName');
      cy.contains('button', 'Create account').click({ force: true });
      cy.contains('First name is required').should('be.visible');
    });

    it('should show error for invalid email format', () => {
      cy.wait(500);
      cy.get('input[placeholder="First name"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="First name"]').type('John', { delay: 10, force: true });
      cy.get('input[placeholder="Last name"]').click({ force: true }).type('Doe', { delay: 10, force: true });
      cy.get('input[placeholder="your@email.com"]').click({ force: true }).type('invalid-email', { delay: 10, force: true });
      cy.get('input[placeholder*="0470"]').click({ force: true }).type('0470123456', { delay: 10, force: true });
      cy.get('input[placeholder="password"]').click({ force: true }).type('Password123', { delay: 10, force: true });

      cy.contains('button', 'Create account').click({ force: true });
      cy.contains('Please enter a valid email address').should('be.visible');
    });
  });

  describe('API Integration', () => {
    it('should successfully register a new user', () => {
      const uniqueEmail = `test.user.${Date.now()}@example.com`;
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: uniqueEmail,
        phone: '0470123456',
        password: 'TestPassword123!',
      };

      fillForm(userData);

      cy.contains('button', 'Create account').click({ force: true });

      cy.wait('@registerRequest').then((interception) => {
        expect(interception.request.body).to.deep.include({
          firstName: userData.firstName,
          name: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phone,
          password: userData.password,
        });
      });

      cy.wait('@loginRequest');
      cy.url().should('not.include', '/register');
      cy.contains('Chats').should('be.visible');
    });

    it('should show error when email already exists', () => {
      const existingEmail = 'john.smith@example.com';

      fillForm({
        firstName: 'Test',
        lastName: 'User',
        email: existingEmail,
        phone: '0470123456',
        password: 'TestPassword123!',
      });

      cy.contains('button', 'Create account').click({ force: true });

      cy.wait('@registerRequest');

      cy.contains(/already registered|already exists|duplicate/i).should('be.visible');
      cy.url().should('include', '/register');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '**/users/register', {
        forceNetworkError: true,
      }).as('networkError');

      fillForm({
        firstName: 'Test',
        lastName: 'User',
        email: 'network.error@test.com',
        phone: '0470123456',
        password: 'TestPassword123!',
      });

      cy.contains('button', 'Create account').click({ force: true });

      cy.contains(/Network error|Check your internet|failed/i, { timeout: 10000 })
        .should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate between login and register pages', () => {
      cy.contains('Log in').click({ force: true });
      cy.url().should('include', '/login');
      cy.wait(500);

      cy.contains('Register here').click({ force: true });
      cy.url().should('include', '/register');
      cy.contains('Create your Eat Up account').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
    ];

    viewports.forEach((viewport) => {
      it(`should render correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);

        cy.contains('Register').should('be.visible');
        cy.contains('button', 'Create account').should('be.visible');
        cy.get('input[placeholder="First name"]').should('be.visible');
        cy.get('input[placeholder="Last name"]').should('be.visible');
        cy.get('input[placeholder="your@email.com"]').should('be.visible');
        cy.get('input[placeholder*="0470"]').should('be.visible');
        cy.get('input[placeholder="password"]').should('be.visible');
      });
    });
  });
});

function fillForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}) {
  cy.wait(500);
  cy.get('input[placeholder="First name"]').should('be.visible').click({ force: true });
  cy.get('input[placeholder="First name"]').clear().type(data.firstName, { delay: 10, force: true });
  cy.get('input[placeholder="Last name"]').click({ force: true }).clear().type(data.lastName, { delay: 10, force: true });
  cy.get('input[placeholder="your@email.com"]').click({ force: true }).clear().type(data.email, { delay: 10, force: true });
  cy.get('input[placeholder*="0470"]').click({ force: true }).clear().type(data.phone, { delay: 10, force: true });
  cy.get('input[placeholder="password"]').click({ force: true }).clear().type(data.password, { delay: 10, force: true });
}

function fillFormExcept(skipField: 'firstName' | 'lastName' | 'email' | 'phone' | 'password') {
  const defaults = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '0470123456',
    password: 'Password123!',
  };

  cy.wait(500);
  if (skipField !== 'firstName') {
    cy.get('input[placeholder="First name"]').should('be.visible').click({ force: true });
    cy.get('input[placeholder="First name"]').type(defaults.firstName, { delay: 10, force: true });
  }
  if (skipField !== 'lastName') {
    cy.get('input[placeholder="Last name"]').click({ force: true }).type(defaults.lastName, { delay: 10, force: true });
  }
  if (skipField !== 'email') {
    cy.get('input[placeholder="your@email.com"]').click({ force: true }).type(defaults.email, { delay: 10, force: true });
  }
  if (skipField !== 'phone') {
    cy.get('input[placeholder*="0470"]').click({ force: true }).type(defaults.phone, { delay: 10, force: true });
  }
  if (skipField !== 'password') {
    cy.get('input[placeholder="password"]').click({ force: true }).type(defaults.password, { delay: 10, force: true });
  }
}
