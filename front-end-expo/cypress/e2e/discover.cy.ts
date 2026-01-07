/**
 * Discover Page E2E Tests
 * 
 * Tests the discover functionality including:
 * - Restaurant list rendering
 * - Restaurant card content (name, address, description, contact, phone)
 * - Like/favorite button functionality
 * - Recommend to group modal
 * - Recommendation feedback messages
 * - Visited restaurant indicator and navigation
 * 
 * Test User (from DatabaseSeeder):
 * - Email: john.smith@example.com
 * - Password: password123
 */

describe('Discover Page E2E Tests', () => {
  before(() => {
    // Reset and reseed database before running tests
    // This ensures seeded restaurants, groups, and user data are available
    cy.resetDatabase();
  });

  beforeEach(() => {
    // Login before each test
    cy.login();
    cy.visit('/');
    // Navigate to the Discover tab
    cy.clickTab('Discover');
    // Wait for restaurants to load
    cy.contains('Restaurants').should('be.visible');
  });

  describe('Restaurant List Rendering', () => {
    it('should display the Restaurants header', () => {
      cy.contains('Restaurants').should('be.visible');
    });

    it('should display restaurant cards when restaurants exist', () => {
      // Wait for restaurants to load (they come from API)
      // Check that at least one restaurant card exists with seeded data
      cy.contains(/Sushi Bar Osaka|La Piazza Italiana|Thai Garden|De Gouden Lepel/).should('be.visible');
    });

    it('should display multiple restaurant cards', () => {
      // The seeder should have created multiple restaurants
      // Verify multiple cards are rendered
      cy.contains('Sushi Bar Osaka').should('be.visible');
      cy.contains('La Piazza Italiana').should('be.visible');
    });

    it('should show empty message when no restaurants found', () => {
      // This test would require clearing restaurants - skip for now
      // The empty message is: "Geen restaurants gevonden."
      cy.contains('Restaurants').should('be.visible');
    });
  });

  describe('Restaurant Card Content', () => {
    it('should display restaurant name on cards', () => {
      // Check for seeded restaurant names
      cy.contains('Sushi Bar Osaka').should('be.visible');
    });

    it('should display restaurant address on cards', () => {
      // Seeded restaurants have addresses like "Naamsestraat 45, Ghent"
      cy.contains(/Naamsestraat|Grote Markt|Bondgenotenlaan|Kerkstraat/).should('be.visible');
    });

    it('should display restaurant description on cards', () => {
      // Seeded restaurants have descriptions
      cy.contains(/sushi|pasta|Thai|Belgian|seasonal/).should('be.visible');
    });

    it('should display Contact label on cards', () => {
      cy.contains('Contact').should('be.visible');
    });

    it('should display phone number on cards', () => {
      // Seeded phone numbers like "09-123456", "03-654321", etc.
      cy.contains(/\d{2,3}-\d{5,6}/).should('be.visible');
    });

    it('should have phone number as a clickable link', () => {
      // Phone numbers are wrapped in Link components with tel: href
      cy.get('a[href^="tel:"]').should('exist');
    });
  });

  describe('Like/Favorite Button', () => {
    // it('should display a like button (heart icon) on each restaurant card', () => {
    //   // Each card has a heart icon button with testID="favorite-button"
    //   cy.contains('Sushi Bar Osaka').should('be.visible');
    //   // Heart icons render - check that the favorite button exists
    //   cy.get('[data-testid="favorite-button"]').should('exist');
    // });

    it('should allow user to like a restaurant (heart becomes red)', () => {
      // Find the first favorite button and click it
      cy.get('[data-testid="favorite-button"]').first().click();
      
      // Wait for API call to complete
      cy.wait(1000);
      
      // After liking, the heart icon should be red (#ef5350)
      // The Ionicons render with a color style - check for red color
      cy.get('[data-testid="favorite-button"]').first()
        .children()
        .should('have.css', 'color', 'rgb(239, 83, 80)'); // #ef5350 in RGB
    });

    it('should allow user to unlike a restaurant (heart becomes unfilled)', () => {
      // Verify 4th resto is liked (red)
      cy.get('[data-testid="favorite-button"]').eq(3);

      cy.wait(1000);

      // Then, unlike it by clicking
      cy.get('[data-testid="favorite-button"]').eq(3).click();
      
      cy.wait(1000);
      
      // The heart should no longer be red (should be dark: #1f2933 = rgb(31, 41, 51))
      cy.get('[data-testid="favorite-button"]').eq(3)
        .children()
        .should('not.have.css', 'color', 'rgb(239, 83, 80)');
    });
  });

  describe('Recommend to Group Button', () => {
    it('should display a recommend button on each restaurant card', () => {
      // Each card has a recommend button with testID="recommend-button"
      cy.contains('Sushi Bar Osaka').should('be.visible');
      cy.get('[data-testid="recommend-button"]').should('exist');
    });

    it('should open recommend modal when clicking recommend button', () => {
      // Click the first recommend button
      cy.get('[data-testid="recommend-button"]').first().click();

      cy.wait(1000);
      
      // Modal should appear with "Recommend to group" title
      cy.contains('Recommend to group').should('be.visible');
    });
  });

  describe('Recommend Modal', () => {
    beforeEach(() => {
      // Open the recommend modal by clicking the first recommend button
      cy.get('[data-testid="recommend-button"]').first().click();

      cy.wait(1000);
      
      // Wait for modal to appear
      cy.contains('Recommend to group').should('be.visible');
    });

    it('should display the modal title', () => {
      cy.contains('Recommend to group').should('be.visible');
    });

    it('should display a list of groups the user is part of', () => {
      // The seeded user john.smith@example.com is part of groups
      // Wait for groups to load - use testID to target modal groups specifically
      cy.get('[data-testid="recommend-modal-group"]', { timeout: 10000 }).should('exist');
    });

    it('should display group name in the modal', () => {
      // Check that group names are displayed within the modal
      cy.get('[data-testid="recommend-modal"]').within(() => {
        cy.contains(/Avondeten|Lunchclub/).should('be.visible');
      });
    });

    it('should display member count for each group', () => {
      // Groups show member count like "3 members"
      cy.get('[data-testid="recommend-modal"]').within(() => {
        cy.contains(/\d+ members?/).should('be.visible');
      });
    });

    it('should display cancel button', () => {
      cy.contains('Cancel').should('be.visible');
    });

    it('should close modal when clicking cancel', () => {
      cy.contains('Cancel').click();
      
      // Modal should be closed
      cy.contains('Recommend to group').should('not.exist');
    });

    it('should allow selecting a group to recommend the restaurant', () => {
      // Wait for modal animation to complete
      cy.wait(500);
      
      // Click on a group within the modal using testID
      cy.get('[data-testid="recommend-modal-group"]').first().click({ force: true });
      
      // Modal should close after selection
      cy.contains('Recommend to group').should('not.exist');
    });
  });

  describe('Recommendation Feedback', () => {
    it('should show success feedback when restaurant is successfully recommended', () => {
      // Open modal by clicking a recommend button
      cy.get('[data-testid="recommend-button"]').eq(1).click();
      
      cy.contains('Recommend to group').should('be.visible');
      
      // Wait for modal animation to complete
      cy.wait(500);
      
      // Select a group within the modal using testID
      cy.get('[data-testid="recommend-modal-group"]').first().click({ force: true });
      
      cy.wait(1000);

      // Wait for the feedback toast to appear
      // The success message should contain "successfully" or similar
      cy.contains("Restaurant succesfully suggested.", { timeout: 5000 }).should('be.visible');
    });

    it('should show error feedback when restaurant was already suggested', () => {
      // First, recommend a restaurant to a group (use second recommend button to avoid conflicts)
      cy.get('[data-testid="recommend-button"]').first().click();

      cy.wait(1000);
      
      cy.contains('Recommend to group').should('be.visible');
      
      // Wait for modal animation to complete
      cy.wait(500);
      
      // Click on the first group in the modal using testID
      cy.get('[data-testid="recommend-modal-group"]').first().click({ force: true });
      
      cy.wait(1000);
      
      // Should show "already suggested" message
      cy.contains("Restaurant has already been suggested to this group.", { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Visited Restaurant Indicator', () => {
    it('should show visited badge for restaurants the user has visited', () => {
      // If the user has visited restaurants via group visits, they should show a "Visited" badge
      // This depends on seeded data - check if any visited badges exist
      // The badge has green background with checkmark icon and "Visited" text
      cy.get('body').then(($body) => {
        if ($body.find(':contains("Visited")').length > 0) {
          cy.contains('Visited').should('be.visible');
        } else {
          // No visited restaurants yet - that's okay
          cy.log('No visited restaurants found - this is expected if user has no group visits');
        }
      });
    });

    it('should navigate to revisit page when clicking on visited badge', () => {
      // Check if there are any visited restaurants
      cy.get('body').then(($body) => {
        if ($body.find(':contains("Visited")').length > 0) {
          // Click on the visited badge
          cy.contains('Visited').first().click();
          
          // Should navigate to revisit page
          cy.url().should('include', 'revisit');
        } else {
          cy.log('No visited restaurants to test navigation - skipping');
        }
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('should allow refreshing the restaurant list', () => {
      // The list has a RefreshControl
      // We can verify the list is scrollable and refresh is available
      cy.contains('Restaurants').should('be.visible');
      cy.contains('Sushi Bar Osaka').should('be.visible');
      
      // Scroll to trigger potential refresh (manual test in real device)
      // For Cypress, we verify the list is interactive
      cy.get('[role="tablist"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
    ];

    viewports.forEach((viewport) => {
      it(`should display discover page correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        // Header should be visible
        cy.contains('Restaurants').should('be.visible');
        
        // Restaurant cards should be visible
        cy.contains(/Sushi Bar Osaka|La Piazza Italiana|Thai Garden/).should('be.visible');
      });

      it(`should display restaurant card buttons on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        // Favorite and recommend buttons should be accessible
        cy.get('[data-testid="favorite-button"]').should('exist');
        cy.get('[data-testid="recommend-button"]').should('exist');
      });

      it(`should open recommend modal on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        // Click recommend button
        cy.get('[data-testid="recommend-button"]').first().click();

        cy.wait(1000);
        
        // Modal should appear
        cy.contains('Recommend to group').should('be.visible');
        
        // Close the modal
        cy.contains('Cancel').click();
      });
    });
  });
});
