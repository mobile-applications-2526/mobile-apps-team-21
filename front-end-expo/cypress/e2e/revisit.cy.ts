// Revisit Page E2E Tests
// Test user: john.smith@example.com has visit history from DatabaseSeeder

describe('Revisit Page E2E Tests', () => {
  before(() => {
    cy.resetDatabase();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.clickTab('Revisit');
    cy.wait(500);
  });

  describe('Search Functionality', () => {
    it('should filter visits by restaurant name', () => {
      cy.get('[data-testid="revisit-card"]').first().then(($card) => {
        const restaurantName = $card.text().split('\n')[0];
        const searchTerm = restaurantName.slice(0, 5);

        cy.get('[data-testid="search-input"]').type(searchTerm);
        cy.wait(300);

        cy.get('[data-testid="revisit-card"]').should('have.length.at.least', 1);
      });
    });

    it('should show no results for non-existent search', () => {
      cy.get('[data-testid="search-input"]').type('xyznonexistent123');
      cy.wait(300);

      cy.get('[data-testid="revisit-card"]').should('have.length', 0);
    });
  });

  describe('Filter Modal', () => {
    beforeEach(() => {
      cy.get('[data-testid="filter-button"]').click({ force: true });
      cy.wait(500);
    });

    it('should test all filters and reset functionality', () => {
      cy.get('[data-testid="filter-modal"]').should('be.visible');

      // Rating Filter - select 3+ stars
      cy.get('[data-testid="filter-modal"]').contains('3+').click({ force: true });
      cy.wait(200);

      // Date Range Filter - select Last 30 days
      cy.get('[data-testid="filter-modal"]').contains('Last 30 days').click({ force: true });
      cy.wait(200);

      // Location Filter (if available)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Location')) {
          cy.get('[data-testid="filter-modal"]').contains(/^All$/).first().click({ force: true });
          cy.wait(200);
        }
      });

      // Reset and apply
      cy.get('[data-testid="filter-reset-button"]').should('be.visible');
      cy.get('[data-testid="filter-reset-button"]').click({ force: true });
      cy.wait(200);

      cy.get('[data-testid="filter-apply-button"]').click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="filter-modal"]').should('not.exist');
    });

    it('should apply rating filter and show filtered results', () => {
      cy.get('[data-testid="revisit-card"]').then(($cards) => {
        const initialCount = $cards.length;

        cy.get('[data-testid="filter-modal"]').contains('4+').click({ force: true });
        cy.wait(200);

        cy.get('[data-testid="filter-apply-button"]').click({ force: true });
        cy.wait(500);

        cy.get('[data-testid="revisit-card"]').should('have.length.at.most', initialCount);
      });
    });
  });

  describe('Visit Details Modal', () => {
    beforeEach(() => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);
    });

    it('should fill in visit details and save changes', () => {
      cy.get('[data-testid="visit-details-modal"]').should('be.visible');

      cy.get('[data-testid="total-bill-input"]').clear().type('55.00');
      cy.get('[data-testid="total-bill-input"]').should('have.value', '55.00');

      cy.get('[data-testid="paid-by-input"]').clear().type('Test User');
      cy.get('[data-testid="paid-by-input"]').should('have.value', 'Test User');

      cy.get('[data-testid="save-changes-button"]').click({ force: true });
      cy.wait(1000);

      cy.get('[data-testid="visit-details-modal"]').should('not.exist');
    });
  });

  describe('Rating Modal', () => {
    beforeEach(() => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="rating-section-button"]').click({ force: true });
      cy.wait(500);
    });

    it('should select rating and submit', () => {
      cy.get('[data-testid="rating-modal"]').should('be.visible');
      cy.contains('Tap a star to rate').should('be.visible');

      cy.get('[data-testid="star-button-4"]').click({ force: true });
      cy.wait(200);

      cy.contains('4 out of 5 stars').should('be.visible');

      cy.get('[data-testid="submit-rating-button"]').click({ force: true });
      cy.wait(1000);

      cy.get('[data-testid="rating-modal"]').should('not.exist');
      cy.get('[data-testid="visit-details-modal"]').should('be.visible');
    });

    it('should skip rating and return to visit details', () => {
      cy.get('[data-testid="skip-rating-button"]').click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="rating-modal"]').should('not.exist');
      cy.get('[data-testid="visit-details-modal"]').should('be.visible');
    });
  });

  describe('Complete Visit Flow', () => {
    it('should complete entire visit editing flow', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="visit-details-modal"]').should('be.visible');

      cy.get('[data-testid="rating-section-button"]').click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="rating-modal"]').should('be.visible');

      cy.get('[data-testid="star-button-4"]').click({ force: true });
      cy.wait(200);
      cy.contains('4 out of 5 stars').should('be.visible');

      cy.get('[data-testid="submit-rating-button"]').click({ force: true });
      cy.wait(1000);

      cy.get('[data-testid="visit-details-modal"]').should('be.visible');

      cy.get('[data-testid="total-bill-input"]').clear().type('75.50');
      cy.get('[data-testid="paid-by-input"]').clear().type('John Smith');

      cy.get('[data-testid="save-changes-button"]').click({ force: true });
      cy.wait(1000);

      cy.get('[data-testid="visit-details-modal"]').should('not.exist');
      cy.contains('Visit History').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12 Pro', width: 390, height: 844 },
      { name: 'iPad Mini', width: 768, height: 1024 },
    ];

    viewports.forEach((viewport) => {
      it(`should display and interact with revisit page on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.wait(300);

        // Open visit details modal
        cy.get('[data-testid="revisit-card"]').first().click({ force: true });
        cy.wait(500);

        cy.get('[data-testid="visit-details-modal"]').should('be.visible');
        cy.get('[data-testid="save-changes-button"]').scrollIntoView();
        cy.get('[data-testid="save-changes-button"]').should('be.visible');
      });
    });
  });
});
