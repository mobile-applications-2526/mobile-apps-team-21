/**
 * Navigation E2E Tests
 * 
 * Tests the tab navigation functionality including:
 * - Tab bar rendering
 * - Navigation between tabs
 * - Active tab highlighting
 * - Responsive behavior
 * 
 * Note: User must be authenticated to access tabs
 * 
 * Test User (from DatabaseSeeder):
 * - Email: john.smith@example.com
 * - Password: password123
 */

describe('Navigation E2E Tests', () => {
  before(() => {
    // Reset and reseed database before running navigation tests
    cy.resetDatabase();
  });

  beforeEach(() => {
    // Login before each test since tabs require authentication
    cy.login();
    cy.visit('/');
    // Wait for redirect to tabs
    cy.url().should('match', /\(tabs\)|tabs/);
  });

  describe('Tab Bar Rendering', () => {
    it('should display the tab navigation bar', () => {
      // Tab bar should be visible
      cy.get('[role="tablist"]').should('be.visible');
    });

    it('should display all expected tabs', () => {
      // Check for all 4 tabs
      cy.contains('Chats').should('be.visible');
      cy.contains('Discover').should('be.visible');
      cy.contains('Revisit').should('be.visible');
      cy.contains('Profile').should('be.visible');
    });

    it('should display tab icons', () => {
      // Icons should be present (Ionicons renders as SVG or text)
      cy.get('[role="tab"]').should('have.length.at.least', 4);
    });
  });

  describe('Tab Navigation', () => {
    it('should start on the Chats tab (index)', () => {
      // Default tab should be Chats (index)
      cy.url().should('match', /\(tabs\)$|\(tabs\)\/index|\/tabs$/);
    });

    it('should navigate to Discover tab when clicked', () => {
      cy.contains('Discover').click();
      cy.url().should('include', 'discover');
    });

    it('should navigate to Revisit tab when clicked', () => {
      cy.contains('Revisit').click();
      cy.url().should('include', 'revisit');
    });

    it('should navigate to Profile tab when clicked', () => {
      cy.contains('Profile').click();
      cy.url().should('include', 'profile');
    });

    it('should navigate back to Chats tab', () => {
      // Navigate away first
      cy.contains('Discover').click();
      cy.url().should('include', 'discover');
      
      // Navigate back to Chats
      cy.contains('Chats').click();
      cy.url().should('match', /\(tabs\)$|\(tabs\)\/index|tabs$/);
    });

    it('should allow sequential navigation through all tabs', () => {
      // Chats -> Discover
      cy.contains('Discover').click();
      cy.url().should('include', 'discover');

      // Discover -> Revisit
      cy.contains('Revisit').click();
      cy.url().should('include', 'revisit');

      // Revisit -> Profile
      cy.contains('Profile').click();
      cy.url().should('include', 'profile');

      // Profile -> Chats
      cy.contains('Chats').click();
      cy.url().should('match', /\(tabs\)$|\(tabs\)\/index|tabs$/);
    });
  });

  describe('Active Tab State', () => {
    it('should highlight the active Chats tab', () => {
      // Initial state - Chats should be active
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Chats');
    });

    it('should highlight Discover tab when selected', () => {
      cy.contains('Discover').click();
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Discover');
    });

    it('should highlight Revisit tab when selected', () => {
      cy.contains('Revisit').click();
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Revisit');
    });

    it('should highlight Profile tab when selected', () => {
      cy.contains('Profile').click();
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Profile');
    });

    it('should only have one active tab at a time', () => {
      cy.contains('Discover').click();
      cy.get('[role="tab"][aria-selected="true"]')
        .should('have.length', 1)
        .and('contain.text', 'Discover');
    });
  });

  describe('Tab Content Loading', () => {
    it('should load Chats page content', () => {
      // Chats page should have some content (groups, messages, etc.)
      cy.get('[role="tabpanel"]').should('be.visible');
    });

    it('should load Discover page content', () => {
      cy.contains('Discover').click();
      // Discover page content
      cy.get('[role="tabpanel"]').should('be.visible');
    });

    it('should load Revisit page content', () => {
      cy.contains('Revisit').click();
      // Revisit page content
      cy.get('[role="tabpanel"]').should('be.visible');
    });

    it('should load Profile page content', () => {
      cy.contains('Profile').click();
      // Profile page content
      cy.get('[role="tabpanel"]').should('be.visible');
    });
  });

  describe('Navigation State Persistence', () => {
    it('should maintain navigation state after page refresh on Discover', () => {
      cy.contains('Discover').click();
      cy.url().should('include', 'discover');
      
      // Refresh page
      cy.reload();
      
      // Login state should be maintained (localStorage)
      cy.url().should('include', 'discover');
    });

    it('should maintain navigation state after page refresh on Profile', () => {
      cy.contains('Profile').click();
      cy.url().should('include', 'profile');
      
      // Refresh page
      cy.reload();
      
      cy.url().should('include', 'profile');
    });
  });

  describe('Direct URL Navigation', () => {
    it('should allow direct navigation to Discover via URL', () => {
      cy.visit('/(tabs)/discover');
      cy.url().should('include', 'discover');
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Discover');
    });

    it('should allow direct navigation to Revisit via URL', () => {
      cy.visit('/(tabs)/revisit');
      cy.url().should('include', 'revisit');
    });

    it('should allow direct navigation to Profile via URL', () => {
      cy.visit('/(tabs)/profile');
      cy.url().should('include', 'profile');
    });
  });

  describe('Responsive Navigation', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
      { name: 'iPad', width: 768, height: 1024 },
    ];

    viewports.forEach((viewport) => {
      it(`should display tab bar correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        // Tab bar should be visible
        cy.get('[role="tablist"]').should('be.visible');
        
        // All tabs should be visible
        cy.contains('Chats').should('be.visible');
        cy.contains('Discover').should('be.visible');
        cy.contains('Revisit').should('be.visible');
        cy.contains('Profile').should('be.visible');
      });

      it(`should navigate correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        // Test navigation
        cy.contains('Profile').click();
        cy.url().should('include', 'profile');
        
        cy.contains('Chats').click();
        cy.url().should('match', /\(tabs\)$|\(tabs\)\/index|tabs$/);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should allow tab navigation with keyboard', () => {
      // Focus on tab bar
      cy.get('[role="tab"]').first().focus();
      
      // Press right arrow to move to next tab
      cy.focused().type('{rightarrow}');
      
      // Press Enter to select
      cy.focused().type('{enter}');
    });
  });
});

describe('Navigation - Unauthenticated User', () => {
  beforeEach(() => {
    // Clear auth state
    cy.logout();
  });

  it('should redirect to login when accessing tabs without auth', () => {
    cy.visit('/(tabs)');
    // Should redirect to login or show login
    cy.url().should('match', /login|index/);
  });

  it('should redirect to login when accessing discover without auth', () => {
    cy.visit('/(tabs)/discover');
    cy.url().should('match', /login|index/);
  });

  it('should redirect to login when accessing profile without auth', () => {
    cy.visit('/(tabs)/profile');
    cy.url().should('match', /login|index/);
  });
});
