/**
 * Navigation E2E Tests
 *
 * Note: User must be authenticated to access tabs
 *
 * Test User (from DatabaseSeeder):
 * - Email: john.smith@example.com
 * - Password: password123
 */

describe('Navigation E2E Tests', () => {
  before(() => {
    cy.resetDatabase();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.get('[role="tablist"]').contains('Chats').should('be.visible');
  });

  describe('Tab Navigation', () => {
    it('should navigate through all tabs sequentially with correct active state', () => {
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Chats');

      cy.clickTab('Discover');
      cy.url().should('include', 'discover');
      cy.get('[role="tab"][aria-selected="true"]')
        .should('have.length', 1)
        .and('contain.text', 'Discover');

      cy.clickTab('Revisit');
      cy.url().should('include', 'revisit');
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Revisit');

      cy.clickTab('Profile');
      cy.url().should('include', 'profile');
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Profile');

      cy.clickTab('Chats');
      cy.url().should('not.include', 'discover');
      cy.url().should('not.include', 'revisit');
      cy.url().should('not.include', 'profile');
    });
  });

  describe('Navigation State Persistence', () => {
    it('should maintain navigation state after page refresh', () => {
      cy.clickTab('Profile');
      cy.url().should('include', 'profile');

      cy.reload();

      cy.url().should('include', 'profile');
    });
  });

  describe('Direct URL Navigation', () => {
    it('should allow direct navigation to tabs via URL', () => {
      cy.visit('/(tabs)/discover');
      cy.url().should('include', 'discover');
      cy.get('[role="tab"][aria-selected="true"]')
        .should('contain.text', 'Discover');

      cy.visit('/(tabs)/revisit');
      cy.url().should('include', 'revisit');

      cy.visit('/(tabs)/profile');
      cy.url().should('include', 'profile');
    });
  });

  describe('Responsive Navigation', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
    ];

    viewports.forEach((viewport) => {
      it(`should display and navigate correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);

        cy.get('[role="tablist"]').should('be.visible');
        cy.get('[role="tablist"]').contains('Chats').should('be.visible');
        cy.get('[role="tablist"]').contains('Discover').should('be.visible');
        cy.get('[role="tablist"]').contains('Revisit').should('be.visible');
        cy.get('[role="tablist"]').contains('Profile').should('be.visible');

        cy.clickTab('Profile');
        cy.url().should('include', 'profile');

        cy.clickTab('Chats');
        cy.url().should('not.include', 'profile');
      });
    });
  });
});
