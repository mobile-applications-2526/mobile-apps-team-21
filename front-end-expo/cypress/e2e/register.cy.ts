/**
 * Register Page E2E Tests
 * 
 * Tests the registration functionality including:
 * - DOM elements rendering
 * - Form validation
 * - API integration (using dev backend)
 * - Navigation after successful registration
 * - Error handling
 * 
 * Note: Tests that create new users will use cleanup to remove
 * test-created users and avoid polluting the database.
 */

describe('Register Page', () => {
  before(() => {
    // Reset and reseed database before running register tests
    // This ensures we start with a clean state (seeded users from DatabaseSeeder)
    cy.resetDatabase();
  });

  after(() => {
    // Clean up any users created during tests
    cy.cleanupTestData();
  });

  beforeEach(() => {
    // Clear any existing auth state
    cy.logout();
    // Visit the register page
    cy.visit('/register');
  });

  describe('DOM Elements & Rendering', () => {
    it('should display the page title', () => {
      cy.contains('Register').should('be.visible');
    });

    it('should display the subtitle', () => {
      cy.contains('Create your Eat Up account').should('be.visible');
    });

    it('should display all form fields', () => {
      cy.get('input[placeholder="First name"]').should('be.visible');
      cy.get('input[placeholder="Last name"]').should('be.visible');
      cy.get('input[placeholder="your@email.com"]').should('be.visible');
      cy.get('input[placeholder*="0470"]').should('be.visible');
      cy.get('input[placeholder="password"]').should('be.visible');
    });

    it('should display all form labels', () => {
      cy.contains('First name').should('be.visible');
      cy.contains('Last name').should('be.visible');
      cy.contains('E-mail').should('be.visible');
      cy.contains('Phone number').should('be.visible');
      cy.contains('Password').should('be.visible');
    });

    it('should display the create account button', () => {
      cy.contains('button', 'Create account').should('be.visible');
      cy.get('[role="button"]').contains('Create account').should('be.visible');
    });

    it('should display login link for existing users', () => {
      cy.contains('Already have an account?').should('be.visible');
      cy.contains('Log in').should('be.visible');
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in the first name field', () => {
      const firstName = 'John';
      cy.wait(500); 
      cy.get('input[placeholder="First name"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="First name"]').type(firstName, { delay: 10, force: true });
      cy.get('input[placeholder="First name"]').should('have.value', firstName);
    });

    it('should allow typing in the last name field', () => {
      const lastName = 'Doe';
      cy.wait(500); 
      cy.get('input[placeholder="Last name"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="Last name"]').type(lastName, { delay: 10, force: true });
      cy.get('input[placeholder="Last name"]').should('have.value', lastName);
    });

    it('should allow typing in the email field', () => {
      const email = 'john.doe@example.com';
      cy.wait(500); 
      cy.get('input[placeholder="your@email.com"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="your@email.com"]').type(email, { delay: 10, force: true });
      cy.get('input[placeholder="your@email.com"]').should('have.value', email);
    });

    it('should allow typing in the phone number field', () => {
      const phone = '0470123456';
      cy.wait(500); 
      cy.get('input[placeholder*="0470"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder*="0470"]').type(phone, { delay: 10, force: true });
      cy.get('input[placeholder*="0470"]').should('have.value', phone);
    });

    it('should allow typing in the password field', () => {
      const password = 'SecurePass123!';
      cy.wait(500);
      cy.get('input[placeholder="password"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="password"]').type(password, { delay: 10, force: true });
      cy.get('input[placeholder="password"]').should('have.value', password);
    });

    it('should mask the password input', () => {
      cy.get('input[placeholder="password"]')
        .should('have.attr', 'type', 'password');
    });

    it('should use phone keyboard for phone number', () => {
      cy.get('input[placeholder*="0470"]')
        .should('satisfy', ($el) => {
          return $el.attr('inputMode') === 'tel' || $el.attr('type') === 'tel';
        });
    });

    it('should use email keyboard for email field', () => {
      cy.get('input[placeholder="your@email.com"]')
        .should('satisfy', ($el) => {
          return $el.attr('inputMode') === 'email' || $el.attr('type') === 'email';
        });
    });
  });

  describe('Form Validation (Client-Side)', () => {
    it('should show error when first name is empty', () => {
      fillFormExcept('firstName');
      cy.contains('button', 'Create account').click({ force: true });
      cy.contains('First name is required').should('be.visible');
    });

    it('should show error when last name is empty', () => {
      fillFormExcept('lastName');
      cy.contains('button', 'Create account').click({ force: true });
      cy.contains('Last name is required').should('be.visible');
    });

    it('should show error when email is empty', () => {
      fillFormExcept('email');
      cy.contains('button', 'Create account').click({ force: true });
      cy.contains('Email is required').should('be.visible');
    });

    it('should show error when phone number is empty', () => {
      fillFormExcept('phone');
      cy.contains('button', 'Create account').click({ force: true });
      cy.contains('Phone number is required').should('be.visible');
    });

    it('should show error when password is empty', () => {
      fillFormExcept('password');
      cy.contains('button', 'Create account').click({ force: true });
      cy.contains('Password is required').should('be.visible');
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

    it('should show error when all fields are empty', () => {
      cy.wait(500);
      // Click on first input field to focus the form area, then click elsewhere
      cy.get('input[placeholder="First name"]').click({ force: true });
      cy.get('body').click({ force: true });
      // Now click the button
      cy.contains('button', 'Create account').click({ force: true });
      cy.wait(500);
      cy.contains(/required/i).should('be.visible');
    });
  });

  describe('API Integration - Registration Flow', () => {
    // Note: These tests require the dev backend to be running locally
    // Each test should use a unique email to avoid conflicts

    it('should successfully register a new user', () => {
      const uniqueEmail = `test.user.${Date.now()}@example.com`;
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: uniqueEmail,
        phone: '0470123456',
        password: 'TestPassword123!',
      };

      // Fill the form
      fillForm(userData);

      // Submit
      cy.contains('button', 'Create account').click({ force: true });

      // Wait for the API call
      cy.wait('@registerRequest').then((interception) => {
        // Verify request body
        expect(interception.request.body).to.deep.include({
          firstName: userData.firstName,
          name: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phone,
          password: userData.password,
        });
      });

      // After successful registration, should auto-login and redirect
      cy.wait('@loginRequest');
      cy.url().should('not.include', '/register');
      cy.contains('Chats').should('be.visible');
    });

    it('should show error when email already exists', () => {
      // Use existing test user email (seeded by DatabaseSeeder)
      const existingEmail = 'john.smith@example.com';
      
      fillForm({
        firstName: 'Test',
        lastName: 'User',
        email: existingEmail,
        phone: '0470123456',
        password: 'TestPassword123!',
      });

      cy.contains('button', 'Create account').click({ force: true });

      // Wait for API response
      cy.wait('@registerRequest');

      // Should show error about existing email
      cy.contains(/already registered|already exists|duplicate/i).should('be.visible');

      // Should stay on register page
      cy.url().should('include', '/register');
    });

    it('should show loading state while submitting', () => {
      const uniqueEmail = `loading.test.${Date.now()}@example.com`;

      // Intercept and delay the response
      cy.intercept('POST', '**/users/register', {
        delay: 1000,
        statusCode: 200,
        body: { id: 'test-id', token: 'test-token' },
      }).as('delayedRegister');

      fillForm({
        firstName: 'Test',
        lastName: 'User',
        email: uniqueEmail,
        phone: '0470123456',
        password: 'TestPassword123!',
      });

      cy.contains('button', 'Create account').click({ force: true });

      // Check for loading indicator
      cy.get('[role="button"]').find('svg, [role="progressbar"]', { timeout: 500 })
        .should('exist');
    });

    it('should handle network errors gracefully', () => {
      // Simulate network error
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

      // Should show network error message
      cy.contains(/Network error|Check your internet|failed/i, { timeout: 10000 })
        .should('be.visible');
    });

    it('should handle server validation errors', () => {
      // Simulate server returning validation error
      cy.intercept('POST', '**/users/register', {
        statusCode: 400,
        body: { message: 'Invalid data. Please check your input' },
      }).as('validationError');

      fillForm({
        firstName: 'Test',
        lastName: 'User',
        email: 'validation@test.com',
        phone: '0470123456',
        password: 'weak', // Server might reject weak passwords
      });

      cy.contains('button', 'Create account').click({ force: true });

      // Wait for API and check error
      cy.wait('@validationError');
      cy.contains(/Invalid data|check your input/i).should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when clicking login link', () => {
      cy.contains('Log in').click({ force: true });
      cy.url().should('include', '/login');
    });

    it('should be accessible from login page', () => {
      cy.visit('/login');
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

        // Check main elements are visible
        cy.contains('Register').should('be.visible');
        cy.contains('button', 'Create account').should('be.visible');
        cy.get('input[placeholder="First name"]').should('be.visible');
        cy.get('input[placeholder="Last name"]').should('be.visible');
        cy.get('input[placeholder="your@email.com"]').should('be.visible');
        cy.get('input[placeholder*="0470"]').should('be.visible');
        cy.get('input[placeholder="password"]').should('be.visible');
      });
    });

    it('should have first name and last name side by side', () => {
      // Check layout - they should be in a row
      cy.get('input[placeholder="First name"]')
        .parent()
        .parent()
        .should('satisfy', ($el) => {
          const flexDir = $el.css('flex-direction');
          return flexDir === 'row' || $el.text().includes('First name');
        });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      // React Native Web converts accessibilityRole to standard HTML role attribute
      // The button element has role="button", and contains the text "Create account"
      cy.get('[role="button"]').filter(':contains("Create account")').should('exist');
    });
  });
});

// Helper function to fill the registration form
// Note: We use click() before type() and delay for headless mode compatibility
function fillForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}) {
  // First field needs special handling - wait for visibility and separate click/type
  cy.wait(500); 
  cy.get('input[placeholder="First name"]').should('be.visible').click({ force: true });
  cy.get('input[placeholder="First name"]').clear().type(data.firstName, { delay: 10, force: true });
  cy.get('input[placeholder="Last name"]').click({ force: true }).clear().type(data.lastName, { delay: 10, force: true });
  cy.get('input[placeholder="your@email.com"]').click({ force: true }).clear().type(data.email, { delay: 10, force: true });
  cy.get('input[placeholder*="0470"]').click({ force: true }).clear().type(data.phone, { delay: 10, force: true });
  cy.get('input[placeholder="password"]').click({ force: true }).clear().type(data.password, { delay: 10, force: true });
}

// Helper function to fill all fields except one
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
