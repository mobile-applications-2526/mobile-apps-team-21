/**
 * Authentication Flow E2E Tests
 *
 * Test User (from DatabaseSeeder):
 * - Email: john.smith@example.com
 * - Password: password123
 */

describe('Authentication Flow', () => {
  const TEST_USER = {
    email: 'john.smith@example.com',
    password: 'password123'
  };

  before(() => {
    cy.resetDatabase();
  });

  after(() => {
    cy.cleanupTestData();
  });

  beforeEach(() => {
    cy.logout();
  });

  describe('Registration Flow', () => {
    it('should complete full registration flow: form -> register -> auto-login -> tabs', () => {
      const uniqueEmail = `flow.test.${Date.now()}@example.com`;

      cy.visit('/register');
      cy.contains('Create your Eat Up account').should('be.visible');

      cy.wait(500);

      cy.get('input[placeholder="First name"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="First name"]').type('Flow', { delay: 10, force: true });
      cy.get('input[placeholder="Last name"]').click({ force: true }).type('Test', { delay: 10, force: true });
      cy.get('input[placeholder="your@email.com"]').click({ force: true }).type(uniqueEmail, { delay: 10, force: true });
      cy.get('input[placeholder*="0470"]').click({ force: true }).type('0470999888', { delay: 10, force: true });
      cy.get('input[placeholder="password"]').click({ force: true }).type('FlowTest123!', { delay: 10, force: true });

      cy.contains('button', 'Create account').click();

      cy.wait('@registerRequest');
      cy.wait('@loginRequest');

      cy.url().should('not.include', '/register');
      cy.url().should('not.include', '/login');
      cy.contains('Chats').should('be.visible');
    });
  });

  describe('Login Flow', () => {
    it('should complete full login flow: form -> login -> tabs with auth state', () => {
      const { email, password } = TEST_USER;

      cy.visit('/login');
      cy.contains('Welcome back!').should('be.visible');

      cy.get('input[placeholder="your@email.com"]').should('be.visible').click({ force: true });
      cy.wait(500);
      cy.get('input[placeholder="your@email.com"]').type(email, { delay: 10, force: true });
      cy.get('input[placeholder="password"]').click({ force: true }).type(password, { delay: 10, force: true });

      cy.contains('button', 'Log in').click();

      cy.wait('@loginRequest');

      cy.url().should('not.include', '/login');
      cy.contains('Chats').should('be.visible');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.not.be.null;
        expect(win.localStorage.getItem('auth_email')).to.eq(email);
      });
    });
  });

  describe('Logout Flow', () => {
    it('should logout, redirect to login, and clear auth state', () => {
      cy.login();
      cy.visit('/');
      cy.contains('Chats').should('be.visible');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.not.be.null;
      });

      cy.contains('Profile').click();

      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });

      cy.contains('Log Out').click();

      cy.url().should('include', 'login');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null;
        expect(win.localStorage.getItem('auth_email')).to.be.null;
      });
    });
  });

  describe('Session Persistence', () => {
    it('should maintain session after page reload', () => {
      cy.login();
      cy.visit('/');
      cy.contains('Chats').should('be.visible');

      cy.reload();

      cy.contains('Chats').should('be.visible');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.not.be.null;
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/');
      cy.url().should('include', 'login');
      cy.contains('Welcome back!').should('be.visible');
    });
  });
});
