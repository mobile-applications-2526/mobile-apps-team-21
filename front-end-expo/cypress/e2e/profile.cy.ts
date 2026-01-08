// Profile Page E2E Tests
// Test user: john.smith@example.com has profile data from DatabaseSeeder

describe('Profile Page E2E Tests', () => {
  before(() => {
    cy.resetDatabase();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.clickTab('Profile');
    cy.wait(500);
  });

  describe('Profile Page', () => {
    it('should display user information', () => {
      cy.contains('John').should('be.visible');
      cy.contains('Smith').should('be.visible');
      cy.contains('john.smith@example.com').should('be.visible');
    });

    it('should log out user when confirmed', () => {
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });

      cy.get('[data-testid="logout-button"]').scrollIntoView();
      cy.get('[data-testid="logout-button"]').click({ force: true });
      cy.wait(500);

      cy.url().should('include', '/login');
    });
  });

  describe('Edit Profile Page', () => {
    beforeEach(() => {
      cy.get('[data-testid="edit-profile-button"]').click({ force: true });
      cy.wait(500);
    });

    it('should display pre-filled user data', () => {
      cy.get('[data-testid="first-name-input"]').should('have.value', 'John');
      cy.get('[data-testid="last-name-input"]').should('have.value', 'Smith');
    });

    it('should allow editing and saving profile', () => {
      cy.get('[data-testid="first-name-input"]').clear().type('Johnny');
      cy.get('[data-testid="last-name-input"]').clear().type('Smithson');
      cy.get('[data-testid="phone-number-input"]').clear().type('0498765432');

      cy.get('[data-testid="first-name-input"]').should('have.value', 'Johnny');
      cy.get('[data-testid="last-name-input"]').should('have.value', 'Smithson');
      cy.get('[data-testid="phone-number-input"]').should('have.value', '0498765432');

      cy.get('[data-testid="save-profile-button"]').click({ force: true });
      cy.wait(1000);
    });
  });

  describe('Privacy Page', () => {
    beforeEach(() => {
      cy.get('[data-testid="privacy-button"]').click({ force: true });
      cy.wait(500);
    });

    it('should display privacy settings', () => {
      cy.contains('Data Privacy').should('be.visible');
      cy.contains('Share usage data').should('be.visible');
      cy.contains('Terms of Service').should('be.visible');
    });
  });

  describe('Visited Restaurants Page', () => {
    beforeEach(() => {
      cy.get('[data-testid="visited-restaurants-button"]').scrollIntoView();
      cy.get('[data-testid="visited-restaurants-button"]').click({ force: true });
      cy.wait(500);
    });

    it('should open rating modal and allow changing rating', () => {
      cy.get('[data-testid="visited-restaurant-card"]').first().click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="rating-modal"]').should('be.visible');
      cy.contains('Rate Your Visit').should('be.visible');

      cy.get('[data-testid="star-button-4"]').click({ force: true });
      cy.wait(200);

      cy.contains('4 out of 5 stars').should('be.visible');

      cy.get('[data-testid="submit-rating-button"]').click({ force: true });
      cy.wait(1000);

      cy.get('[data-testid="rating-modal"]').should('not.exist');
    });
  });

  describe('Favorite Restaurants Page', () => {
    beforeEach(() => {
      cy.get('[data-testid="favorite-restaurants-button"]').scrollIntoView();
      cy.get('[data-testid="favorite-restaurants-button"]').click({ force: true });
      cy.wait(500);
    });

    it('should open recommend modal when recommend button is clicked', () => {
      cy.get('[data-testid="recommend-restaurant-button"]').first().click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="recommend-modal"]').should('be.visible');
      cy.contains('Recommend to group').should('be.visible');
    });

    it('should unfavorite restaurant when heart button is clicked and confirmed', () => {
      cy.get('[data-testid="favorite-restaurant-card"]').then(($cards) => {
        const initialCount = $cards.length;

        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
        });

        cy.get('[data-testid="unfavorite-restaurant-button"]').first().click({ force: true });
        cy.wait(1000);

        if (initialCount > 1) {
          cy.get('[data-testid="favorite-restaurant-card"]').should('have.length', initialCount - 1);
        } else {
          cy.contains('No favorite restaurants yet').should('be.visible');
        }
      });
    });
  });

  describe('Help & Support Page', () => {
    beforeEach(() => {
      cy.get('[data-testid="help-support-button"]').scrollIntoView();
      cy.get('[data-testid="help-support-button"]').click({ force: true });
      cy.wait(500);
    });

    it('should display FAQ section with questions', () => {
      cy.contains('Contact Us').should('be.visible');
      cy.contains('FAQ').should('be.visible');
      cy.contains('How do I create a group?').should('be.visible');
      cy.contains('How do I change my password?').should('be.visible');
      cy.contains('How do I favorite a restaurant?').should('be.visible');
      cy.contains('Email Support').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12 Pro', width: 390, height: 844 },
      { name: 'iPad Mini', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 800 },
    ];

    viewports.forEach((viewport) => {
      it(`should display and interact with profile page on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.wait(300);

        cy.contains('Profile').should('be.visible');
        cy.get('[data-testid="edit-profile-button"]').click({ force: true });
        cy.wait(500);

        cy.get('[data-testid="first-name-input"]').should('be.visible');
        cy.get('[data-testid="save-profile-button"]').scrollIntoView();
        cy.get('[data-testid="save-profile-button"]').should('be.visible');
      });
    });
  });
});

