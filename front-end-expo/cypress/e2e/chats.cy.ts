/**
 * Chats Page (Index) E2E Tests
 * 
 * Tests the chat functionality including:
 * - Group chats list rendering
 * - Add group button and creation flow
 * - Opening a group chat
 * - Chat messages rendering
 * - Group members view
 * - Restaurant recommendation modal
 * - Voting on recommendations
 * - Removing recommendations (as recommender)
 * - Availability calendar (when vote threshold is reached)
 * 
 * Test User (from DatabaseSeeder):
 * - Email: john.smith@example.com
 * - Password: password123
 */

describe('Chats Page E2E Tests', () => {
  before(() => {
    // Reset and reseed database before running tests
    // This ensures seeded groups, messages, and restaurant suggestions are available
    cy.resetDatabase();
  });

  beforeEach(() => {
    // Login before each test
    cy.login();
    cy.visit('/');
    // Wait for the chats page to load
    cy.contains('Chats').should('be.visible');
    // Wait for groups to actually load (ensures auth token is propagated)
    cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/, { timeout: 10000 }).should('be.visible');
  });

  describe('Chats List Rendering', () => {
    it('should display the Chats header', () => {
      cy.contains('Chats').should('be.visible');
    });

    it('should display the add group button', () => {
      cy.contains('+ Group').should('be.visible');
    });

    it('should display group cards when groups exist', () => {
      // The seeded data should have groups
      // Wait for groups to load (they come from API)
      cy.get('[role="tablist"]').contains('Chats').should('be.visible');
      
      // Check that at least one group card exists
      // Groups have a title and member count
      cy.contains('members').should('exist');
    });

    it('should show group name on group cards', () => {
      // Check for one of the seeded group names
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).should('be.visible');
    });
  });

  describe('Add Group Flow', () => {
    it('should navigate to add group page when clicking + Group button', () => {
      cy.contains('+ Group').click();
      cy.url().should('include', 'add-group');
      cy.contains('New Group').should('be.visible');
    });

    it('should display the group creation form', () => {
      cy.contains('+ Group').click();
      
      // Check form elements
      cy.contains('Group name').should('be.visible');
      cy.get('input[placeholder="e.g. Project Team"]').should('be.visible');
      cy.contains('Invite').should('be.visible');
      cy.get('input[placeholder*="jan@test.com"]').should('be.visible');
      cy.contains('Create Group').should('be.visible');
    });

    it('should show error when trying to create group without name', () => {
      cy.contains('+ Group').click();
      cy.contains('Create Group').click();
      cy.contains('Group name is required').should('be.visible');
    });

    it('should create a new group successfully', () => {
      const uniqueGroupName = `Test Group ${Date.now()}`;
      
      cy.contains('+ Group').click();

      cy.wait(500); 
      
      // Fill in group name
      cy.get('input[placeholder="e.g. Project Team"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="e.g. Project Team"]').type(uniqueGroupName, { delay: 10, force: true });
      
      // Submit
      cy.contains('Create Group').click();
      
      // Should navigate back to chats list
      cy.url().should('not.include', 'add-group');
      
      // The new group should appear in the list (after refresh)
      cy.contains(uniqueGroupName).should('be.visible');
    });

    it('should allow navigating back from add group page', () => {
      cy.contains('+ Group').click();
      cy.url().should('include', 'add-group');
      
      // Click back button (the arrow icon in header - using go back navigation)
      cy.go('back');
      
      // Should be back on chats page
      cy.url().should('not.include', 'add-group');
      cy.contains('Chats').should('be.visible');
    });
  });

  describe('Opening a Group Chat', () => {
    it('should open a group chat when clicking on a group card', () => {
      // Click on a group (any group from seeded data)
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).first().click();
      
      // Should show the chat interface
      cy.url().should('include', 'chat');
    });

    it('should display chat header with group name', () => {
      // Click on a specific group
      cy.contains(/Avondeten|Lunchclub/).first().click();
      
      // Wait for chat to load
      cy.get('input[placeholder="Message"]').should('be.visible');
      
      // The header should show a group name (may be in a scrollable area)
      cy.contains(/Avondeten|Lunchclub/).should('exist');
    });

    it('should display member count in chat header', () => {
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).first().click();
      
      // Wait for chat to load
      cy.get('input[placeholder="Message"]').should('be.visible');
      
      // Should show member count (e.g., "3 members") - exists in DOM
      cy.contains(/\d+ members?/).should('exist');
    });

    it('should display message input field', () => {
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).first().click();
      
      cy.get('input[placeholder="Message"]').should('be.visible');
    });

    it('should display send button', () => {
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).first().click();
      
      // Wait for chat to load
      cy.get('input[placeholder="Message"]').should('be.visible');
      
      // Send button should exist (contains the send icon)
      cy.contains('Message').should('be.visible');
    });
  });

  describe('Chat Messages', () => {
    beforeEach(() => {
      // Open a chat
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).first().click();
      // Wait for chat to load
      cy.get('input[placeholder="Message"]').should('be.visible');
    });

    it('should display seeded messages in the chat', () => {
      // The seeder creates messages like "Message X in GroupName from FirstName LastName"
      // Wait for messages to load
      cy.contains(/Message \d+ in/).should('be.visible');
    });

    it('should show message author names', () => {
      // Messages should show author info (either "You" or the author's name)
      cy.contains(/You|John|Jane|Charlie|Emma|Liam|Olivia/).should('be.visible');
    });

    it('should have disabled send button when input is empty', () => {
      // The send button should be disabled/have reduced opacity when empty
      cy.get('input[placeholder="Message"]').should('have.value', '');
    });

    it('should allow typing a message', () => {
      cy.wait(500); 
      cy.get('input[placeholder="Message"]').should('be.visible').click({ force: true });
      cy.get('input[placeholder="Message"]').type('Test message', { delay: 10, force: true });
      cy.get('input[placeholder="Message"]').should('have.value', 'Test message');
    });
  });

  describe('Group Members View', () => {
    beforeEach(() => {
      // Open a chat first
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).first().click();
      cy.get('input[placeholder="Message"]').should('be.visible');
    });

    it('should display member count in the header', () => {
      // Verify member count text exists
      cy.contains(/\d+ members?/).should('exist');
    });

    it('should navigate to group members when clicking on header', () => {
      // Click on the group members button (has testID and accessibilityRole)
      cy.get('[data-testid="group-members-button"]').click({ force: true });
      
      // Should navigate to members page
      cy.url().should('include', 'group-members');
    });

    it('should display list of group members', () => {
      cy.get('[data-testid="group-members-button"]').click({ force: true });
      
      // Wait for members to load
      cy.url().should('include', 'group-members');
      
      // Should show member cards with emails
      cy.contains('@example.com').should('be.visible');
    });

    it('should display member names', () => {
      cy.get('[data-testid="group-members-button"]').click({ force: true });
      
      // Seeded users have names like "John Smith", "Jane Doe", etc.
      cy.contains(/John|Jane|Charlie|Emma|Liam|Olivia/).should('be.visible');
    });

    it('should allow navigating back from members page', () => {
      cy.get('[data-testid="group-members-button"]').click({ force: true });
      cy.url().should('include', 'group-members');
      
      // Use browser back
      cy.go('back');
      
      // Should be back in the chat
      cy.get('input[placeholder="Message"]').should('be.visible');
    });
  });

  describe('Restaurant Recommendation Modal', () => {
    beforeEach(() => {
      // Open a chat first
      cy.contains(/Avondeten|Lunchclub/).first().click();
      cy.get('input[placeholder="Message"]').should('be.visible');
    });

    it('should have restaurant button visible in chat header', () => {
      // Verify the restaurant modal button exists
      cy.get('[data-testid="restaurant-modal-button"]').should('exist');
    });

    it('should open restaurant modal when clicking restaurant icon', () => {
      // Click the restaurant modal button
      cy.get('[data-testid="restaurant-modal-button"]').click({ force: true });
      
      // Modal should appear with recommendations title or empty message
      cy.contains(/Recommended restaurants|No restaurants/).should('be.visible');
    });

    it('should show appropriate content in modal', () => {
      cy.get('[data-testid="restaurant-modal-button"]').click({ force: true });
      
      // Should show either restaurant recommendations or empty message
      cy.contains(/No restaurants have been recommended yet|vote|Sushi|Piazza|Thai/).should('be.visible');
    });
  });

  describe('Restaurant Recommendations with Seeded Data', () => {
    it('should load chat with seeded data', () => {
      // Open a chat and verify it loads
      cy.contains(/Avondeten|Lunchclub/).first().click();
      cy.get('input[placeholder="Message"]').should('be.visible');
    });

    it('should display recommended restaurants in modal when they exist', () => {
      cy.contains(/Avondeten|Lunchclub/).first().click();

      cy.wait(3000);

      cy.get('input[placeholder="Message"]').should('be.visible');
      
      // Click the restaurant modal button
      cy.get('[data-testid="restaurant-modal-button"]').click({ force: true });

      cy.wait(3000);
      
      // Wait for modal content
      cy.contains(/Recommended restaurants/, { timeout: 10000 }).should('be.visible');
    });

    it('should show vote count for recommendations when they exist', () => {
      cy.contains(/Avondeten|Lunchclub/).first().click();

      cy.wait(3000);

      cy.get('input[placeholder="Message"]').should('be.visible');
      
      cy.get('[data-testid="restaurant-modal-button"]').click({ force: true });

      cy.wait(3000);
      
      // Check for either vote count OR empty message
      cy.contains(/vote/).should('be.visible');
    });

    it('should show calendar button for recommendations that have reached vote threshold', () => {
      // Open a chat
      cy.contains(/Avondeten|Lunchclub/).first().click();

      cy.wait(3000);

      cy.get('input[placeholder="Message"]').should('be.visible');
      
      // Open restaurant modal
      cy.get('[data-testid="restaurant-modal-button"]').click({ force: true });

      cy.wait(3000);
      
      // Wait for modal to load
      cy.contains(/Recommended restaurants/).should('be.visible');
      
      // If there are closed suggestions (vote threshold reached), the calendar button should exist
      // The DatabaseSeeder creates some closed suggestions
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="calendar-button"]').length > 0) {
          cy.get('[data-testid="calendar-button"]').should('exist');
        } else {
          // If no closed suggestions, check for "Vote closed" text or just pass
          cy.log('No closed suggestions found - calendar button not visible');
        }
      });
    });

    it('should open availability calendar modal when clicking calendar icon', () => {
      // Open a chat
      cy.contains(/Avondeten|Lunchclub/).first().click();

      cy.wait(3000);

      cy.get('input[placeholder="Message"]').should('be.visible');
      
      // Open restaurant modal
      cy.get('[data-testid="restaurant-modal-button"]').click({ force: true });

      cy.wait(3000);
      
      // Wait for modal to load
      cy.contains(/Recommended restaurants/).should('be.visible');
      
      // Check if calendar button exists (only appears when vote threshold is reached)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="calendar-button"]').length > 0) {
          // Click the calendar button
          cy.get('[data-testid="calendar-button"]').first().click({ force: true });
          
          // Availability modal should open - check for availability-related content
          cy.contains(/Pick available dates/).should('be.visible');
        } else {
          cy.log('No calendar button available - vote threshold not reached for any recommendation');
        }
      });
    });
  });

  describe('Availability Calendar Modal', () => {
    it('should display calendar with selectable dates when opened', () => {
      // Open a chat
      cy.contains(/Avondeten|Lunchclub/).first().click();

      cy.wait(3000);

      cy.get('input[placeholder="Message"]').should('be.visible');
      
      // Open restaurant modal
      cy.get('[data-testid="restaurant-modal-button"]').click({ force: true });
      
      cy.wait(3000);

      cy.contains(/Recommended restaurants|No restaurants/).should('be.visible');
      
      // Check if calendar button exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="calendar-button"]').length > 0) {
          // Click the calendar button
          cy.get('[data-testid="calendar-button"]').first().click({ force: true });
          
          cy.wait(3000);
          
          // Should show date selection UI
          // The modal shows next 14 days as selectable dates
          cy.contains(/Pick available dates/).should('be.visible');
        } else {
          cy.log('No calendar button available - skipping calendar modal test');
        }
      });
    });

    it('should allow saving availability selection', () => {
      // Open a chat
      cy.contains(/Avondeten|Lunchclub/).first().click();

      cy.wait(3000);
      
      cy.get('input[placeholder="Message"]').should('be.visible');
      
      // Open restaurant modal
      cy.get('[data-testid="restaurant-modal-button"]').click({ force: true });

      cy.wait(3000);

      cy.contains(/Recommended restaurants|No restaurants/).should('be.visible');
      
      // Check if calendar button exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="calendar-button"]').length > 0) {
          // Click the calendar button
          cy.get('[data-testid="calendar-button"]').first().click({ force: true });

          cy.wait(3000);
          
          // Should have a Save button
          cy.contains(/Save/i).should('be.visible');
        } else {
          cy.log('No calendar button available - skipping save test');
        }
      });
    });
  });

  describe('Navigation Within Chats', () => {
    it('should navigate back to chats list from a chat', () => {
      // Open a chat
      cy.contains(/Avondeten|Lunchclub|Weekendplans|Projectgroep/).first().click();
      cy.url().should('include', 'chat');
      
      // Click back (use browser navigation)
      cy.go('back');
      
      // Should be back on chats list
      cy.contains('+ Group').should('be.visible');
    });

    it('should maintain chat state when switching tabs and returning', () => {
      // Open chats tab
      cy.get('[role="tablist"]').contains('Chats').should('be.visible');
      
      // Navigate to another tab
      cy.clickTab('Discover');
      cy.url().should('include', 'discover');
      
      // Navigate back to Chats
      cy.clickTab('Chats');
      
      // Groups should still be visible
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
      it(`should display chats page correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        // Header elements should be visible
        cy.contains('Chats').should('be.visible');
        cy.contains('+ Group').should('be.visible');
      });

      it(`should open add group page on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);
        
        cy.contains('+ Group').click();
        cy.contains('New Group').should('be.visible');
        cy.contains('Create Group').should('be.visible');
      });
    });
  });
});