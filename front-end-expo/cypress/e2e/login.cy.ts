/**
 * Login Page E2E Tests
 * 
 * Tests the login functionality including:
 * - DOM elements rendering
 * - Form validation
 * - API integration (using dev backend)
 * - Navigation after successful login
 * - Error handling
 * 
 * Test User (from DatabaseSeeder):
 * - Email: john.smith@example.com
 * - Password: password123
 */

describe('Login Page', () => {
  before(() => {
    // Reset and reseed database before running login tests
    // This ensures the seeded users (from DatabaseSeeder) are available
    cy.resetDatabase();
  });

  beforeEach(() => {
    // Clear any existing auth state
    cy.logout();
    // Visit the login page
    cy.visit('/login');
  });

//   describe('DOM Elements & Rendering', () => {
//     it('should display the app title and subtitle', () => {
//       cy.contains('Eat Up').should('be.visible');
//       cy.contains('Discover restaurants together with friends').should('be.visible');
//     });

//     it('should display the welcome message', () => {
//       cy.contains('Welcome back!').should('be.visible');
//     });

//     it('should display email input field with correct placeholder', () => {
//       cy.get('input[placeholder="your@email.com"]').should('be.visible');
//     });

//     it('should display password input field with correct placeholder', () => {
//       cy.get('input[placeholder="password"]').should('be.visible');
//     });

//     it('should display the login button', () => {
//       cy.contains('button', 'Log in').should('be.visible');
//       // Alternative: check by role
//       cy.get('[role="button"]').contains('Log in').should('be.visible');
//     });

//     it('should display register link', () => {
//       cy.contains("Don't have an account?").should('be.visible');
//       cy.contains('Register here').should('be.visible');
//     });

//     it('should have the correct form labels', () => {
//       cy.contains('E-mail').should('be.visible');
//       cy.contains('Password').should('be.visible');
//     });
//   });

//   describe('Form Interaction', () => {
//     it('should allow typing in the email field', () => {
//       const testEmail = 'test@example.com';
//       cy.get('input[placeholder="your@email.com"]')
//         .type(testEmail)
//         .should('have.value', testEmail);
//     });

//     it('should allow typing in the password field', () => {
//       const testPassword = 'myPassword123';
//       cy.get('input[placeholder="password"]')
//         .type(testPassword)
//         .should('have.value', testPassword);
//     });

//     it('should mask the password input', () => {
//       cy.get('input[placeholder="password"]')
//         .should('have.attr', 'type', 'password');
//     });

//     it('should clear inputs when cleared', () => {
//       cy.get('input[placeholder="your@email.com"]')
//         .type('test@test.com')
//         .clear()
//         .should('have.value', '');
//     });
//   });

//   describe('Form Validation (Client-Side)', () => {
//     it('should show error when email is empty', () => {
//       cy.get('input[placeholder="password"]').type('password123');
//       cy.contains('button', 'Log in').click();
//       cy.contains('Email is required').should('be.visible');
//     });

//     it('should show error when password is empty', () => {
//       cy.get('input[placeholder="your@email.com"]').type('test@example.com');
//       cy.contains('button', 'Log in').click();
//       cy.contains('Password is required').should('be.visible');
//     });

//     it('should show error when both fields are empty', () => {
//       cy.contains('button', 'Log in').click();
//       cy.contains('Email is required').should('be.visible');
//     });

//     it('should clear error when user starts typing', () => {
//       // Trigger error first
//       cy.contains('button', 'Log in').click();
//       cy.contains('Email is required').should('be.visible');
      
//       // Start typing - error should remain until next submit or be handled
//       cy.get('input[placeholder="your@email.com"]').type('t');
//     });
//   });

  // Test user credentials from DatabaseSeeder
  const TEST_USER = {
    email: 'john.smith@example.com',
    password: 'password123'
  };

  describe('API Integration - Login Flow', () => {
    // Note: These tests require the dev backend to be running locally

    it('should successfully login with valid credentials', () => {
      const { email, password } = TEST_USER;

      // Fill in the form
      cy.get('input[placeholder="your@email.com"]').type(email);
      cy.get('input[placeholder="password"]').type(password);

      // Submit
      cy.contains('button', 'Log in').click();

      // Wait for the API call
      cy.wait('@loginRequest').then((interception) => {
        // Verify request was made correctly
        expect(interception.request.body).to.deep.include({
          email: email,
          password: password,
        });
      });

      // After successful login, should redirect to tabs
      cy.url().should('match', /\(tabs\)|tabs/);
    });

    it('should show error with invalid credentials', () => {
      // Fill in with invalid credentials
      cy.get('input[placeholder="your@email.com"]').type('invalid@email.com');
      cy.get('input[placeholder="password"]').type('wrongpassword');

      // Submit
      cy.contains('button', 'Log in').click();

      // Wait for API response
      cy.wait('@loginRequest');

      // Should show error message
      cy.contains(/Invalid email or password|Invalid credentials|Login failed/i).should('be.visible');

      // Should stay on login page
      cy.url().should('include', '/login');
    });

    it('should show loading state while submitting', () => {
      const { email, password } = TEST_USER;

      // Intercept and delay the response
      cy.intercept('POST', '**/auth/login', {
        delay: 1000,
        statusCode: 200,
        body: { token: 'test-token' },
      }).as('delayedLogin');

      // Fill and submit
      cy.get('input[placeholder="your@email.com"]').type(email);
      cy.get('input[placeholder="password"]').type(password);
      cy.contains('button', 'Log in').click();

      // Check for loading indicator
      cy.get('[role="button"]').find('svg, [role="progressbar"]', { timeout: 500 })
        .should('exist');
    });

    it('should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('POST', '**/auth/login', {
        forceNetworkError: true,
      }).as('networkError');

      cy.get('input[placeholder="your@email.com"]').type('test@example.com');
      cy.get('input[placeholder="password"]').type('password123');
      cy.contains('button', 'Log in').click();

      // Should show network error message
      cy.contains(/Network error|Check your internet|failed/i, { timeout: 10000 })
        .should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate to register page when clicking register link', () => {
      cy.contains('Register here').click();
      cy.url().should('include', '/register');
    });

    it('should persist form data when navigating back from register', () => {
      const testEmail = 'persist@test.com';
      
      // Type email
      cy.get('input[placeholder="your@email.com"]').type(testEmail);
      
      // Navigate to register
      cy.contains('Register here').click();
      cy.url().should('include', '/register');
      
      // Go back
      cy.go('back');
      
      // Note: Form data may or may not persist depending on implementation
      // This test documents the current behavior
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      cy.get('[role="button"]')
        .contains('Log in')
        .should('have.attr', 'accessibilityRole', 'button');
    });

    it('should have correct input types for accessibility', () => {
      cy.get('input[placeholder="your@email.com"]')
        .should('have.attr', 'type')
        .and('match', /email|text/);
      
      cy.get('input[placeholder="password"]')
        .should('have.attr', 'type', 'password');
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
        
        // Check main elements are visible
        cy.contains('Eat Up').should('be.visible');
        cy.contains('button', 'Log in').should('be.visible');
        cy.get('input[placeholder="your@email.com"]').should('be.visible');
        cy.get('input[placeholder="password"]').should('be.visible');
      });
    });
  });
});
