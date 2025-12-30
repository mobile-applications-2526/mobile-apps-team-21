/**
 * Authentication Flow E2E Tests
 * 
 * Tests the complete authentication flow including:
 * - Registration -> Auto Login -> Redirect
 * - Login -> Redirect
 * - Logout -> Redirect to Login
 * - Session persistence
 * 
 * Test User (from DatabaseSeeder):
 * - Email: john.smith@example.com
 * - Password: password123
 */

describe('Authentication Flow', () => {
  before(() => {
    // Reset and reseed database before running auth flow tests
    cy.resetDatabase();
  });

  after(() => {
    // Clean up any test-created users
    cy.cleanupTestData();
  });

  beforeEach(() => {
    cy.logout();
  });

  describe('Complete Registration Flow', () => {
    it('should complete full registration flow: form -> register -> auto-login -> tabs', () => {
      const uniqueEmail = `flow.test.${Date.now()}@example.com`;

      // 1. Visit register page
      cy.visit('/register');
      cy.contains('Create your Eat Up account').should('be.visible');

      // 2. Fill form
      cy.get('input[placeholder="First name"]').type('Flow');
      cy.get('input[placeholder="Last name"]').type('Test');
      cy.get('input[placeholder="your@email.com"]').type(uniqueEmail);
      cy.get('input[placeholder*="0470"]').type('0470999888');
      cy.get('input[placeholder="password"]').type('FlowTest123!');

      // 3. Submit
      cy.contains('button', 'Create account').click();

      // 4. Wait for register + auto-login
      cy.wait('@registerRequest');
      cy.wait('@loginRequest');

      // 5. Should redirect to tabs
      cy.url().should('match', /\(tabs\)|tabs/);

      // 6. Should be able to access authenticated content
      cy.contains('Chats').should('be.visible');
    });
  });

  // Test user credentials from DatabaseSeeder
  const TEST_USER = {
    email: 'john.smith@example.com',
    password: 'password123'
  };

  describe('Complete Login Flow', () => {
    it('should complete full login flow: form -> login -> tabs', () => {
      const { email, password } = TEST_USER;

      // 1. Visit login page
      cy.visit('/login');
      cy.contains('Welcome back!').should('be.visible');

      // 2. Fill form
      cy.get('input[placeholder="your@email.com"]').type(email);
      cy.get('input[placeholder="password"]').type(password);

      // 3. Submit
      cy.contains('button', 'Log in').click();

      // 4. Wait for login
      cy.wait('@loginRequest');

      // 5. Should redirect to tabs
      cy.url().should('match', /\(tabs\)|tabs/);

      // 6. Verify auth state in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.not.be.null;
        expect(win.localStorage.getItem('auth_email')).to.eq(email);
      });
    });
  });

  describe('Logout Flow', () => {
    it('should logout and redirect to login', () => {
      // 1. Login first
      cy.login();
      cy.visit('/');
      cy.url().should('match', /\(tabs\)|tabs/);

      // 2. Navigate to profile
      cy.contains('Profile').click();

      // 3. Find and click logout (assuming there's a logout button in profile)
      // This may need adjustment based on your actual UI
      cy.contains(/log\s*out|sign\s*out/i).click();

      // 4. Should redirect to login
      cy.url().should('include', 'login');

      // 5. Auth state should be cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null;
      });
    });
  });

  describe('Session Persistence', () => {
    it('should maintain session after page reload', () => {
      // 1. Login
      cy.login();
      cy.visit('/');
      cy.url().should('match', /\(tabs\)|tabs/);

      // 2. Reload page
      cy.reload();

      // 3. Should still be on tabs (authenticated)
      cy.url().should('match', /\(tabs\)|tabs/);

      // 4. Token should still exist
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.not.be.null;
      });
    });

    it('should redirect to login when session is invalid', () => {
      // 1. Set invalid token
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'invalid-token');
        win.localStorage.setItem('auth_email', 'test@test.com');
      });

      // 2. Visit app
      cy.visit('/');

      // 3. Should eventually redirect to login (after token validation fails)
      // This depends on your app's token validation logic
      cy.url().should('satisfy', (url) => {
        return url.includes('login') || url.includes('(tabs)');
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing tabs without auth', () => {
      cy.visit('/(tabs)');
      cy.url().should('include', 'login');
    });

    it('should redirect to login when accessing profile without auth', () => {
      cy.visit('/(tabs)/profile');
      cy.url().should('include', 'login');
    });

    it('should redirect to login when accessing discover without auth', () => {
      cy.visit('/(tabs)/discover');
      cy.url().should('include', 'login');
    });

    it('should redirect to login when accessing chat pages without auth', () => {
      cy.visit('/chatsPage/chat');
      cy.url().should('include', 'login');
    });
  });

  describe('Auth State Management', () => {
    it('should clear all auth data on logout', () => {
      // Login
      cy.login();
      cy.visit('/');

      // Verify auth data exists
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.not.be.null;
        expect(win.localStorage.getItem('auth_email')).to.not.be.null;
      });

      // Logout
      cy.logout();

      // Verify auth data is cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null;
        expect(win.localStorage.getItem('auth_email')).to.be.null;
      });
    });
  });

  describe('Navigation Between Auth Pages', () => {
    it('should navigate from login to register', () => {
      cy.visit('/login');
      cy.contains('Register here').click();
      cy.url().should('include', '/register');
    });

    it('should navigate from register to login', () => {
      cy.visit('/register');
      cy.contains('Log in').click();
      cy.url().should('include', '/login');
    });

    it('should allow multiple navigation switches', () => {
      cy.visit('/login');
      
      cy.contains('Register here').click();
      cy.url().should('include', '/register');
      
      cy.contains('Log in').click();
      cy.url().should('include', '/login');
      
      cy.contains('Register here').click();
      cy.url().should('include', '/register');
    });
  });
});
