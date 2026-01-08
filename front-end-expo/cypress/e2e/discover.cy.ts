/**
 * Discover Page E2E Tests
 *
 * Test User (from DatabaseSeeder):
 * - Email: john.smith@example.com
 * - Password: password123
 */

describe('Discover Page E2E Tests', () => {
  before(() => {
    cy.resetDatabase();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.clickTab('Discover');
    cy.contains('Restaurants').should('be.visible');
  });

  describe('Like/Favorite Button', () => {
    it('should allow user to like a restaurant (heart becomes red)', () => {
      cy.get('[data-testid="favorite-button"]').first().click();
      cy.wait(1000);

      cy.get('[data-testid="favorite-button"]').first()
        .children()
        .should('have.css', 'color', 'rgb(239, 83, 80)');
    });

    it('should allow user to unlike a restaurant (heart becomes unfilled)', () => {
      cy.get('[data-testid="favorite-button"]').eq(3);
      cy.wait(1000);

      cy.get('[data-testid="favorite-button"]').eq(3).click();
      cy.wait(1000);

      cy.get('[data-testid="favorite-button"]').eq(3)
        .children()
        .should('not.have.css', 'color', 'rgb(239, 83, 80)');
    });
  });

  describe('Recommend Modal', () => {
    beforeEach(() => {
      cy.get('[data-testid="recommend-button"]').first().click();
      cy.wait(1000);
      cy.contains('Recommend to group').should('be.visible');
    });

    it('should display groups and allow selecting one', () => {
      cy.get('[data-testid="recommend-modal"]').within(() => {
        cy.contains(/Avondeten|Lunchclub/).should('be.visible');
        cy.contains(/\d+ members?/).should('be.visible');
      });

      cy.get('[data-testid="recommend-modal-group"]').first().click({ force: true });
      cy.contains('Recommend to group').should('not.exist');
    });

    it('should close modal when clicking cancel', () => {
      cy.contains('Cancel').click();
      cy.contains('Recommend to group').should('not.exist');
    });
  });

  describe('Recommendation Feedback', () => {
    it('should show success feedback when restaurant is successfully recommended', () => {
      cy.get('[data-testid="recommend-button"]').eq(1).click();
      cy.contains('Recommend to group').should('be.visible');
      cy.wait(500);

      cy.get('[data-testid="recommend-modal-group"]').first().click({ force: true });
      cy.wait(1000);

      cy.contains('Restaurant succesfully suggested.', { timeout: 5000 }).should('be.visible');
    });

    it('should show error feedback when restaurant was already suggested', () => {
      cy.get('[data-testid="recommend-button"]').first().click();
      cy.wait(1000);
      cy.contains('Recommend to group').should('be.visible');
      cy.wait(500);

      cy.get('[data-testid="recommend-modal-group"]').first().click({ force: true });
      cy.wait(1000);

      cy.contains('Restaurant has already been suggested to this group.', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Visited Restaurant Indicator', () => {
    it('should show visited badge and navigate to revisit page when clicked', () => {
      cy.get('body').then(($body) => {
        if ($body.find(':contains("Visited")').length > 0) {
          cy.contains('Visited').should('be.visible');
          cy.contains('Visited').first().click();
          cy.url().should('include', 'revisit');
        } else {
          cy.log('No visited restaurants found - skipping');
        }
      });
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
    ];

    viewports.forEach((viewport) => {
      it(`should display and interact with discover page on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);

        cy.contains(/Sushi Bar Osaka|La Piazza Italiana|Thai Garden/).should('be.visible');

        cy.get('[data-testid="recommend-button"]').first().click();
        cy.wait(1000);

        cy.contains('Recommend to group').should('be.visible');
        cy.contains('Cancel').click();
      });
    });
  });
});
