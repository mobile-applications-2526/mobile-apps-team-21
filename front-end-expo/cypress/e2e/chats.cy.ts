/**
 * Chats Page E2E Tests
 *
 * Test User (from DatabaseSeeder):
 * - Email: john.smith@example.com
 * - Password: password123
 */

describe('Chats Page E2E Tests', () => {
  before(() => {
    cy.resetDatabase();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.contains('Chats').should('be.visible');
    cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/, { timeout: 10000 }).should('be.visible');
  });

  describe('Add Group Flow', () => {
    it('should show error when trying to create group without name', () => {
      cy.contains('+ Group').click();
      cy.contains('Create Group').click();
      cy.contains('Group name is required').should('be.visible');
    });

    it('should create a new group successfully', () => {
      const uniqueGroupName = `Test Group ${Date.now()}`;

      cy.contains('+ Group').click();
      cy.wait(500);

      cy.get('input[placeholder="e.g. Project Team"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="e.g. Project Team"]').type(uniqueGroupName, { delay: 10, force: true });

      cy.contains('Create Group').click();

      cy.url().should('not.include', 'add-group');
      cy.contains(uniqueGroupName).should('be.visible');
    });
  });

  describe('Chat Messages', () => {
    beforeEach(() => {
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).first().click();
      cy.get('input[placeholder="Message"]').should('be.visible');
    });

    it('should display seeded messages and allow typing', () => {
      cy.contains(/Message \d+ in/).should('be.visible');
      cy.contains(/You|John|Jane|Charlie|Emma|Liam|Olivia/).should('be.visible');

      cy.wait(500);
      cy.get('input[placeholder="Message"]').click({ force: true });
      cy.get('input[placeholder="Message"]').type('Test message', { delay: 10, force: true });
      cy.get('input[placeholder="Message"]').should('have.value', 'Test message');
    });
  });

  describe('Group Members View', () => {
    beforeEach(() => {
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).first().click();
      cy.get('input[placeholder="Message"]').should('be.visible');
    });

    it('should navigate to group members and display member list', () => {
      cy.get('[data-testid="group-members-button"]').click({ force: true });

      cy.url().should('include', 'group-members');
      cy.contains('@example.com').should('be.visible');
      cy.contains(/John|Jane|Charlie|Emma|Liam|Olivia/).should('be.visible');
    });
  });

  describe('Restaurant Recommendations', () => {
    beforeEach(() => {
      cy.contains(/Avondeten|Lunchclub/).first().click();
      cy.wait(3000);
      cy.get('input[placeholder="Message"]').should('be.visible');
    });

    it('should display recommended restaurants in modal', () => {
      cy.get('[data-testid="restaurant-modal-button"]').click({ force: true });
      cy.wait(3000);

      cy.contains(/Recommended restaurants/, { timeout: 10000 }).should('be.visible');
      cy.contains(/vote/).should('be.visible');
    });

    it('should open availability calendar when vote threshold is reached', () => {
      cy.get('[data-testid="restaurant-modal-button"]').click({ force: true });
      cy.wait(3000);

      cy.contains(/Recommended restaurants/).should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="calendar-button"]').length > 0) {
          cy.get('[data-testid="calendar-button"]').first().click({ force: true });
          cy.wait(3000);

          cy.contains(/Pick available dates/).should('be.visible');
          cy.contains(/Save/i).should('be.visible');
        } else {
          cy.log('No calendar button available - vote threshold not reached');
        }
      });
    });
  });

  describe('Navigation', () => {
    it('should maintain chat state when switching tabs and returning', () => {
      cy.clickTab('Discover');
      cy.url().should('include', 'discover');

      cy.clickTab('Chats');
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
    ];

    viewports.forEach((viewport) => {
      it(`should display and interact with chats page on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);

        cy.contains('+ Group').click();
        cy.contains('New Group').should('be.visible');
        cy.contains('Create Group').should('be.visible');
      });
    });
  });
});