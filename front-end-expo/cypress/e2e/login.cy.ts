/**
 * Login Page E2E Tests
 *
 * Test User (from DatabaseSeeder):
 * - Email: john.smith@example.com
 * - Password: password123
 */

describe('Login Page', () => {
  const TEST_USER = {
    email: 'john.smith@example.com',
    password: 'password123'
  };

  before(() => {
    cy.resetDatabase();
  });

  beforeEach(() => {
    cy.logout();
    cy.visit('/login');
  });

  describe('Form Validation', () => {
    it('should show error when fields are empty and clear when typing', () => {
      cy.wait(500);
      cy.get('input[placeholder="your@email.com"]').click({ force: true });
      cy.get('body').click({ force: true });
      cy.contains('button', 'Log in').click({ force: true });
      cy.wait(500);
      cy.contains('Email is required').should('be.visible');

      cy.get('input[placeholder="your@email.com"]').click({ force: true }).type('t', { delay: 10, force: true });
      cy.wait(500);
      cy.contains('Email is required').should('not.exist');
    });

    it('should show error when email is empty', () => {
      cy.wait(500);
      cy.get('input[placeholder="password"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="password"]').type('password123', { delay: 10, force: true });
      cy.contains('button', 'Log in').click({ force: true });
      cy.contains('Email is required').should('be.visible');
    });

    it('should show error when password is empty', () => {
      cy.wait(500);
      cy.get('input[placeholder="your@email.com"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="your@email.com"]').type('test@example.com', { delay: 10, force: true });
      cy.contains('button', 'Log in').click({ force: true });
      cy.contains('Password is required').should('be.visible');
    });
  });

  describe('API Integration', () => {
    it('should successfully login with valid credentials', () => {
      const { email, password } = TEST_USER;

      cy.wait(500);
      cy.get('input[placeholder="your@email.com"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="your@email.com"]').type(email, { delay: 10, force: true });
      cy.get('input[placeholder="password"]').click({ force: true }).type(password, { delay: 10, force: true });

      cy.contains('button', 'Log in').click({ force: true });

      cy.wait('@loginRequest').then((interception) => {
        expect(interception.request.body).to.deep.include({
          email: email,
          password: password,
        });
      });

      cy.url().should('not.include', '/login');
      cy.contains('Chats').should('be.visible');
    });

    it('should show error with invalid credentials', () => {
      cy.wait(500);
      cy.get('input[placeholder="your@email.com"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="your@email.com"]').type('invalid@email.com', { delay: 10, force: true });
      cy.get('input[placeholder="password"]').click({ force: true }).type('wrongpassword', { delay: 10, force: true });

      cy.contains('button', 'Log in').click({ force: true });

      cy.wait('@loginRequest');

      cy.contains(/Invalid email or password|Invalid credentials|Login failed/i).should('be.visible');
      cy.url().should('include', '/login');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '**/auth/login', {
        forceNetworkError: true,
      }).as('networkError');

      cy.wait(500);
      cy.get('input[placeholder="your@email.com"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="your@email.com"]').type('test@example.com', { delay: 10, force: true });
      cy.get('input[placeholder="password"]').click({ force: true }).type('password123', { delay: 10, force: true });
      cy.contains('button', 'Log in').click({ force: true });

      cy.contains(/Network error|Check your internet|failed/i, { timeout: 10000 })
        .should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate to register page when clicking register link', () => {
      cy.contains('Register here').click({ force: true });
      cy.url().should('include', '/register');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
    ];

    viewports.forEach((viewport) => {
      it(`should render and function correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);

        cy.contains('Eat Up').should('be.visible');
        cy.get('input[placeholder="your@email.com"]').should('be.visible');
        cy.get('input[placeholder="password"]').should('be.visible');
        cy.contains('button', 'Log in').should('be.visible');
      });
    });
  });
});
