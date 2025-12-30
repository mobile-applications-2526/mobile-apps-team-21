// describe('Navigation E2E Tests', () => {
//   beforeEach(() => {
//     cy.visit('/pages/home')
//   })

//   it('should display the tab navigation with all expected tabs', () => {
//     // Check if all tab buttons are visible
//     cy.get('.custom-tab-bar').should('be.visible')
//     cy.get('[tab="home"]').should('be.visible')
//     cy.get('[tab="tab2"]').should('be.visible')
//     cy.get('[tab="tab3"]').should('be.visible')
//     cy.get('[tab="tab4"]').should('be.visible')
    
//     // Check for FAB button
//     cy.get('.fab-button').should('be.visible')
//     cy.get('.fab-button ion-icon[name="add"]').should('be.visible')
//   })

//   it('should navigate to home tab when home icon is clicked', () => {
//     cy.get('[tab="home"]').click()
//     cy.url().should('include', '/pages/home')
    
//     // Check if home tab is selected
//     cy.get('[tab="home"]').should('have.class', 'tab-selected')
//   })

//   it('should navigate to discover tab when discover icon is clicked', () => {
//     cy.get('[tab="tab2"]').click()
//     cy.url().should('include', '/pages/tab2')
    
//     // Check if discover tab is selected
//     cy.get('[tab="tab2"]').should('have.class', 'tab-selected')
    
//     // Check if discover page content is loaded
//     cy.contains('Hello Niels!').should('be.visible')
//     cy.contains('Popular runs').should('be.visible')
//   })

//   it('should navigate to tab3 when tab3 icon is clicked', () => {
//     cy.get('[tab="tab3"]').click()
//     cy.url().should('include', '/pages/tab3')
    
//     // Check if tab3 is selected
//     cy.get('[tab="tab3"]').should('have.class', 'tab-selected')
//   })

//   it('should navigate to profile tab when profile icon is clicked', () => {
//     cy.get('[tab="tab4"]').click()
//     cy.url().should('include', '/pages/tab4')
    
//     // Check if profile tab is selected
//     cy.get('[tab="tab4"]').should('have.class', 'tab-selected')
//   })

//   it('should have working FAB button', () => {
//     cy.get('.fab-button').should('be.visible')
//     cy.get('.fab-button').click()
    
//     // Could check for modal opening or action, depending on implementation
//     // For now, just verify click doesn't cause errors
//     cy.get('.fab-button').should('exist')
//   })

//   it('should highlight active tab with correct styling', () => {
//     // Navigate to discover tab
//     cy.get('[tab="tab2"]').click()
    
//     // Check active tab styling
//     cy.get('[tab="tab2"]').should('have.class', 'tab-selected')
//     cy.get('[tab="tab2"] .tab-icon-container').should('have.css', 'background-color')
    
//     // Check inactive tabs don't have selected class
//     cy.get('[tab="home"]').should('not.have.class', 'tab-selected')
//     cy.get('[tab="tab3"]').should('not.have.class', 'tab-selected')
//     cy.get('[tab="tab4"]').should('not.have.class', 'tab-selected')
//   })

//   it('should have responsive navigation bar', () => {
//     // Test different viewport sizes
//     cy.viewport(320, 568) // iPhone SE
//     cy.get('.custom-tab-bar').should('be.visible')
//     cy.get('.fab-button').should('be.visible')
    
//     cy.viewport(375, 812) // iPhone X
//     cy.get('.custom-tab-bar').should('be.visible')
//     cy.get('.fab-button').should('be.visible')
    
//     cy.viewport(768, 1024) // iPad
//     cy.get('.custom-tab-bar').should('be.visible')
//     cy.get('.fab-button').should('be.visible')
//   })

//   it('should maintain navigation state when refreshing page', () => {
//     // Navigate to discover tab
//     cy.get('[tab="tab2"]').click()
//     cy.url().should('include', '/pages/tab2')
    
//     // Refresh page
//     cy.reload()
    
//     // Check that we're still on the correct page
//     cy.url().should('include', '/pages/tab2')
//     cy.get('[tab="tab2"]').should('have.class', 'tab-selected')
//   })

//   it('should have proper accessibility attributes', () => {
//     // Check for proper ARIA attributes and roles
//     cy.get('.custom-tab-bar').should('have.attr', 'role')
    
//     // Each tab button should be accessible
//     cy.get('[tab="home"]').should('be.visible').and('not.be.disabled')
//     cy.get('[tab="tab2"]').should('be.visible').and('not.be.disabled')
//     cy.get('[tab="tab3"]').should('be.visible').and('not.be.disabled')
//     cy.get('[tab="tab4"]').should('be.visible').and('not.be.disabled')
    
//     // FAB should be accessible
//     cy.get('.fab-button').should('be.visible').and('not.be.disabled')
//   })

//   it('should handle rapid tab switching', () => {
//     // Rapidly switch between tabs
//     cy.get('[tab="tab2"]').click()
//     cy.get('[tab="tab3"]').click()
//     cy.get('[tab="home"]').click()
//     cy.get('[tab="tab4"]').click()
//     cy.get('[tab="tab2"]').click()
    
//     // Final state should be correct
//     cy.url().should('include', '/pages/tab2')
//     cy.get('[tab="tab2"]').should('have.class', 'tab-selected')
//   })
// })