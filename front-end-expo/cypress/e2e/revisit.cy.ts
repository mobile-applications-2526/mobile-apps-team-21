// Revisit Page E2E Tests
// Test user: john.smith@example.com has visit history from DatabaseSeeder

describe('Revisit Page', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.login();
    cy.visit('/');
    cy.clickTab('Revisit');
    cy.wait(500);
  });

  describe('Page Access & Header', () => {
    it('should display the revisit page header', () => {
      cy.contains('Visit History').should('be.visible');
    });

    it('should display search input', () => {
      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="search-input"]').should('have.attr', 'placeholder', 'Search restaurants...');
    });

    it('should display filter button', () => {
      cy.get('[data-testid="filter-button"]').should('be.visible');
    });
  });

  describe('Visit List Rendering', () => {
    it('should display visit cards', () => {
      cy.get('[data-testid="revisit-card"]').should('have.length.at.least', 1);
    });

    it('should display visit card content', () => {
      cy.get('[data-testid="revisit-card"]').first().within(() => {
        // Restaurant name should be visible
        cy.contains(/\w+/).should('be.visible');
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter visits by restaurant name', () => {
      // Get the first restaurant name for searching
      cy.get('[data-testid="revisit-card"]').first().then(($card) => {
        const restaurantName = $card.text().split('\n')[0];
        const searchTerm = restaurantName.slice(0, 5); // First 5 chars

        // Type in search input
        cy.get('[data-testid="search-input"]').type(searchTerm);
        cy.wait(300);

        // Verify filtered results contain the search term
        cy.get('[data-testid="revisit-card"]').should('have.length.at.least', 1);
      });
    });

    it('should show no results for non-existent search', () => {
      cy.get('[data-testid="search-input"]').type('xyznonexistent123');
      cy.wait(300);
      
      // Either no cards or an empty state message
      cy.get('[data-testid="revisit-card"]').should('have.length', 0);
    });
  });

  describe('Filter Modal', () => {
    it('should open filter modal when filter button is clicked', () => {
      cy.get('[data-testid="filter-button"]').click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="filter-modal"]').should('be.visible');
      cy.contains('Filters').should('be.visible');
    });

    it('should test ALL filters in one go (rating, date range, location, cuisine)', () => {
      cy.get('[data-testid="filter-button"]').click({ force: true });
      cy.wait(500);

      // Verify filter modal is open
      cy.get('[data-testid="filter-modal"]').should('be.visible');

      // 1. Rating Filter - select 3+ stars
      cy.contains('Minimum Rating').should('be.visible');
      cy.contains('Any').should('be.visible');
      cy.get('[data-testid="filter-modal"]').contains('3+').click({ force: true });
      cy.wait(200);

      // 2. Date Range Filter - select Last 30 days
      cy.contains('Date Range').should('be.visible');
      cy.contains('All time').should('be.visible');
      cy.get('[data-testid="filter-modal"]').contains('Last 30 days').click({ force: true });
      cy.wait(200);

      // 3. Location Filter (if available)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Location')) {
          cy.get('[data-testid="filter-modal"]').contains('Location').should('be.visible');
          // Click 'All' location - use exact match to avoid clicking "All time"
          cy.get('[data-testid="filter-modal"]').contains(/^All$/).first().click({ force: true });
          cy.wait(200);
        }
      });

      // 4. Cuisine Filter (if available)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Cuisine')) {
          // Scroll to cuisine filter to make it visible
          cy.get('[data-testid="filter-modal"]').contains('Cuisine').scrollIntoView();
          cy.wait(200);
          cy.get('[data-testid="filter-modal"]').contains('Cuisine').should('be.visible');
        }
      });

      // Reset button should now be visible since filters are active
      cy.get('[data-testid="filter-reset-button"]').should('be.visible');

      // Test reset functionality
      cy.get('[data-testid="filter-reset-button"]').click({ force: true });
      cy.wait(200);

      // Apply filters
      cy.get('[data-testid="filter-apply-button"]').click({ force: true });
      cy.wait(500);

      // Modal should close
      cy.get('[data-testid="filter-modal"]').should('not.exist');
    });

    it('should apply rating filter and show filtered results', () => {
      // Get initial count
      cy.get('[data-testid="revisit-card"]').then(($cards) => {
        const initialCount = $cards.length;

        // Open filter modal
        cy.get('[data-testid="filter-button"]').click({ force: true });
        cy.wait(500);

        // Select 4+ star rating
        cy.get('[data-testid="filter-modal"]').contains('4+').click({ force: true });
        cy.wait(200);

        // Apply filters
        cy.get('[data-testid="filter-apply-button"]').click({ force: true });
        cy.wait(500);

        // Verify filtered results - should be less than or equal to initial count
        cy.get('[data-testid="revisit-card"]').should('have.length.at.most', initialCount);

        // Filter button should indicate active filter (different styling)
        cy.get('[data-testid="filter-button"]').should('be.visible');
      });
    });
  });

  describe('Visit Details Modal', () => {
    it('should open visit details modal when card is pressed', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="visit-details-modal"]').should('be.visible');
      cy.contains('Visit Details').should('be.visible');
    });

    it('should display restaurant information in modal', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="visit-details-modal"]').within(() => {
        // Modal sections should be visible
        cy.contains('Your Rating').should('be.visible');
        cy.contains('Total Bill').should('be.visible');
        cy.contains('Paid By').should('be.visible');
      });
    });

    it('should have rating section with tap to rate', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="visit-details-modal"]').within(() => {
        cy.contains('Your Rating').should('be.visible');
        cy.get('[data-testid="rating-section-button"]').should('be.visible');
      });
    });

    it('should have Total Bill input field', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="visit-details-modal"]').within(() => {
        cy.contains('Total Bill').should('be.visible');
        cy.get('[data-testid="total-bill-input"]').should('be.visible');
        cy.get('[data-testid="total-bill-input"]').should('have.attr', 'placeholder', '0.00');
      });
    });

    it('should allow typing in Total Bill input', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="total-bill-input"]').clear().type('45.50');
      cy.get('[data-testid="total-bill-input"]').should('have.value', '45.50');
    });

    it('should have Paid By input field', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="visit-details-modal"]').within(() => {
        cy.contains('Paid By').should('be.visible');
        cy.get('[data-testid="paid-by-input"]').should('be.visible');
        cy.get('[data-testid="paid-by-input"]').should('have.attr', 'placeholder', 'Who paid?');
      });
    });

    it('should allow typing in Paid By input', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="paid-by-input"]').clear().type('John Smith');
      cy.get('[data-testid="paid-by-input"]').should('have.value', 'John Smith');
    });

    it('should have Save Changes button', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="save-changes-button"]').should('be.visible');
      cy.get('[data-testid="save-changes-button"]').contains('Save Changes');
    });

    it('should fill in visit details and save changes', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);

      // Fill in Total Bill
      cy.get('[data-testid="total-bill-input"]').clear().type('55.00');
      
      // Fill in Paid By
      cy.get('[data-testid="paid-by-input"]').clear().type('Test User');

      // Click Save Changes
      cy.get('[data-testid="save-changes-button"]').click({ force: true });
      cy.wait(1000);

      // Modal should close after save
      cy.get('[data-testid="visit-details-modal"]').should('not.exist');
    });
  });

  describe('Rating Modal', () => {
    it('should open rating modal when rating section is pressed', () => {
      // Open visit details first
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);

      // Click on rating section
      cy.get('[data-testid="rating-section-button"]').click({ force: true });
      cy.wait(500);

      // Rating modal should appear
      cy.get('[data-testid="rating-modal"]').should('be.visible');
      cy.contains('Rate Your Visit').should('be.visible');
    });

    it('should display 5 star buttons', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="rating-section-button"]').click({ force: true });
      cy.wait(500);

      for (let i = 1; i <= 5; i++) {
        cy.get(`[data-testid="star-button-${i}"]`).should('be.visible');
      }
    });

    it('should show "Tap a star to rate" initially', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="rating-section-button"]').click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="rating-modal"]').contains('Tap a star to rate').should('be.visible');
    });

    it('should update rating text when star is clicked', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="rating-section-button"]').click({ force: true });
      cy.wait(500);

      // Click 4th star
      cy.get('[data-testid="star-button-4"]').click({ force: true });
      cy.wait(200);

      cy.get('[data-testid="rating-modal"]').contains('4 out of 5 stars').should('be.visible');
    });

    it('should have Skip and Submit Rating buttons', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="rating-section-button"]').click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="skip-rating-button"]').should('be.visible');
      cy.get('[data-testid="submit-rating-button"]').should('be.visible');
    });

    it('should skip rating and return to visit details', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="rating-section-button"]').click({ force: true });
      cy.wait(500);

      cy.get('[data-testid="skip-rating-button"]').click({ force: true });
      cy.wait(500);

      // Should return to visit details modal
      cy.get('[data-testid="rating-modal"]').should('not.exist');
      cy.get('[data-testid="visit-details-modal"]').should('be.visible');
    });

    it('should submit rating and update visit details', () => {
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="rating-section-button"]').click({ force: true });
      cy.wait(500);

      // Select 5 stars
      cy.get('[data-testid="star-button-5"]').click({ force: true });
      cy.wait(200);

      // Submit rating
      cy.get('[data-testid="submit-rating-button"]').click({ force: true });
      cy.wait(1000);

      // Should return to visit details modal with updated rating
      cy.get('[data-testid="rating-modal"]').should('not.exist');
      cy.get('[data-testid="visit-details-modal"]').should('be.visible');
    });
  });

  describe('Complete Visit Flow', () => {
    it('should complete entire visit editing flow', () => {
      // 1. Open a visit card
      cy.get('[data-testid="revisit-card"]').first().click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="visit-details-modal"]').should('be.visible');

      // 2. Open rating modal
      cy.get('[data-testid="rating-section-button"]').click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="rating-modal"]').should('be.visible');

      // 3. Select a rating (4 stars)
      cy.get('[data-testid="star-button-4"]').click({ force: true });
      cy.wait(200);
      cy.contains('4 out of 5 stars').should('be.visible');

      // 4. Submit rating
      cy.get('[data-testid="submit-rating-button"]').click({ force: true });
      cy.wait(1000);

      // 5. Back to visit details
      cy.get('[data-testid="visit-details-modal"]').should('be.visible');

      // 6. Fill in Total Bill
      cy.get('[data-testid="total-bill-input"]').clear().type('75.50');

      // 7. Fill in Paid By
      cy.get('[data-testid="paid-by-input"]').clear().type('John Smith');

      // 8. Save changes
      cy.get('[data-testid="save-changes-button"]').click({ force: true });
      cy.wait(1000);

      // 9. Modal should close
      cy.get('[data-testid="visit-details-modal"]').should('not.exist');

      // 10. Verify we're back on the revisit page
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
        it(`should display correctly on ${viewport.name}`, () => {
            cy.viewport(viewport.width, viewport.height);
            cy.wait(300);

            // Header should be visible
            cy.contains('Visit History').should('be.visible');

            // Search input should be visible
            cy.get('[data-testid="search-input"]').should('be.visible');

            // Filter button should be visible
            cy.get('[data-testid="filter-button"]').should('be.visible');

            // Visit cards should be displayed
            cy.get('[data-testid="revisit-card"]').should('have.length.at.least', 1);
        });
    });

    viewports.forEach((viewport) => {
        it(`should display filter modal correctly on ${viewport.name}`, () => {
            cy.viewport(viewport.width, viewport.height);
            cy.wait(300);

            cy.get('[data-testid="filter-button"]').click({ force: true });
            cy.wait(500);

            cy.get('[data-testid="filter-modal"]').should('be.visible');
            cy.contains('Filters').should('be.visible');
            cy.get('[data-testid="filter-apply-button"]').should('be.visible');

            // Close modal
            cy.get('[data-testid="filter-apply-button"]').click({ force: true });
        });
    });

    viewports.forEach((viewport) => {
        it(`should display visit details modal correctly on ${viewport.name}`, () => {
            cy.viewport(viewport.width, viewport.height);
            cy.wait(300);

            cy.get('[data-testid="revisit-card"]').first().click({ force: true });
            cy.wait(500);

            cy.get('[data-testid="visit-details-modal"]').should('be.visible');
            cy.contains('Visit Details').should('be.visible');
            cy.get('[data-testid="total-bill-input"]').should('be.visible');
            cy.get('[data-testid="paid-by-input"]').should('be.visible');
            
            // Scroll to save button for smaller viewports
            cy.get('[data-testid="save-changes-button"]').scrollIntoView();
            cy.get('[data-testid="save-changes-button"]').should('be.visible');
        });
    });
});
});
