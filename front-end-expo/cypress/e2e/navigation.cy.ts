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
    // Wait for authenticated content to appear - check tab bar specifically
    cy.get('[role="tablist"]').contains('Chats').should('be.visible');
  });

  describe('Tab Bar Rendering', () => {
    it('should display the tab navigation bar', () => {
      // Tab bar should be visible
      cy.get('[role="tablist"]').should('be.visible');
    });

    it('should display all expected tabs', () => {
      // Check for all 4 tabs in the tab bar
      cy.get('[role="tablist"]').contains('Chats').should('be.visible');
      cy.get('[role="tablist"]').contains('Discover').should('be.visible');
      cy.get('[role="tablist"]').contains('Revisit').should('be.visible');
      cy.get('[role="tablist"]').contains('Profile').should('be.visible');
    });

    it('should display tab icons', () => {
      // Icons should be present (Ionicons renders as SVG or text)
      cy.get('[role="tab"]').should('have.length.at.least', 4);
    });
  });

  describe('Tab Navigation', () => {
    it('should start on the Chats tab (index)', () => {
      // Default tab should be Chats (index)
      // Verify by checking content in tab bar
      cy.get('[role="tablist"]').contains('Chats').should('be.visible');
    });

    it('should navigate to Discover tab when clicked', () => {
      cy.clickTab('Discover');
      cy.url().should('include', 'discover');
    });

    it('should navigate to Revisit tab when clicked', () => {
      cy.clickTab('Revisit');
      cy.url().should('include', 'revisit');
    });

    it('should navigate to Profile tab when clicked', () => {
      cy.clickTab('Profile');
      cy.url().should('include', 'profile');
    });

    it('should navigate back to Chats tab', () => {
      // Navigate away first
      cy.clickTab('Discover');
      cy.url().should('include', 'discover');
      
      // Navigate back to Chats
      cy.clickTab('Chats');
      // Verify we're back on Chats by checking the URL doesn't include other tabs
      cy.url().should('not.include', 'discover');
      cy.url().should('not.include', 'revisit');
      cy.url().should('not.include', 'profile');
    });

    it('should allow sequential navigation through all tabs', () => {
      // Chats -> Discover
      cy.clickTab('Discover');
      cy.url().should('include', 'discover');

      // Discover -> Revisit
      cy.clickTab('Revisit');
      cy.url().should('include', 'revisit');

      // Revisit -> Profile
      cy.clickTab('Profile');
      cy.url().should('include', 'profile');

      // Profile -> Chats
      cy.clickTab('Chats');
      cy.url().should('not.include', 'profile');
    });
  });

  describe('Active Tab State', () => {
    it('should highlight the active Chats tab', () => {
      // Initial state - Chats should be active
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Chats');
    });

    it('should highlight Discover tab when selected', () => {
      cy.clickTab('Discover');
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Discover');
    });

    it('should highlight Revisit tab when selected', () => {
      cy.clickTab('Revisit');
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Revisit');
    });

    it('should highlight Profile tab when selected', () => {
      cy.clickTab('Profile');
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Profile');
    });

    it('should only have one active tab at a time', () => {
      cy.clickTab('Discover');
      cy.get('[role="tab"][aria-selected="true"]')
        .should('have.length', 1)
        .and('contain.text', 'Discover');
    });
  });

  describe('Tab Content Loading', () => {
    it('should load Chats page content', () => {
      // Chats page should have the page header
      cy.contains('Chats').should('be.visible');
    });

    it('should load Discover page content', () => {
      cy.clickTab('Discover');
      // Discover page should have some content
      cy.contains('Discover').should('be.visible');
    });

    it('should load Revisit page content', () => {
      cy.clickTab('Revisit');
      // Revisit page should have some content
      cy.contains('Revisit').should('be.visible');
    });

    it('should load Profile page content', () => {
      cy.clickTab('Profile');
      // Profile page should have some content
      cy.contains('Profile').should('be.visible');
    });
  });

  describe('Navigation State Persistence', () => {
    it('should maintain navigation state after page refresh on Discover', () => {
      cy.clickTab('Discover');
      cy.url().should('include', 'discover');
      
      // Refresh page
      cy.reload();
      
      // Login state should be maintained (localStorage)
      cy.url().should('include', 'discover');
    });

    it('should maintain navigation state after page refresh on Profile', () => {
      cy.clickTab('Profile');
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
        cy.get('[role="tablist"]').contains('Chats').should('be.visible');
        cy.get('[role="tablist"]').contains('Discover').should('be.visible');
        cy.get('[role="tablist"]').contains('Revisit').should('be.visible');
        cy.get('[role="tablist"]').contains('Profile').should('be.visible');
      });

      it(`should navigate correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        // Test navigation
        cy.clickTab('Profile');
        cy.url().should('include', 'profile');
        
        // Navigate back to Chats
        cy.clickTab('Chats');
        // Verify we're back on Chats by checking the URL doesn't include other tabs
        cy.url().should('not.include', 'discover');
        cy.url().should('not.include', 'revisit');
        cy.url().should('not.include', 'profile');

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
