import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  e2e: {
    // Base URL for your local dev server (Expo web)
    baseUrl: 'http://localhost:8081',
    
    // Support file location
    supportFile: 'cypress/support/e2e.ts',
    
    // Spec file pattern
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Test isolation - each test starts fresh
    testIsolation: true,
    
    // Viewport settings for mobile testing
    viewportWidth: 390,
    viewportHeight: 844,
    
    // Video recording
    video: false,
    
    // Screenshots on failure
    screenshotOnRunFailure: true,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      // Get API URL from .env (CYPRESS_BASE_URL) - falls back to localhost
      const apiBaseUrl = process.env.CYPRESS_BASE_URL || 'http://localhost:8080';
      config.env.API_BASE_URL = apiBaseUrl;

      // Register tasks for database operations
      on('task', {
        // Task to reset the test database
        async resetDatabase() {
          try {
            const response = await fetch(`${apiBaseUrl}/test/reset-database`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) {
              console.log('Database reset failed with status:', response.status);
              return null;
            }
            
            return response.json();
          } catch (error) {
            console.log('Database reset endpoint not available:', error);
            return null;
          }
        },
        
        // Task to seed test data
        async seedTestData(data: { type: string }) {
          try {
            const response = await fetch(`${apiBaseUrl}/test/seed`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            
            if (!response.ok) {
              console.log('Seed endpoint failed with status:', response.status);
              return null;
            }
            
            return response.json();
          } catch (error) {
            console.log('Seed endpoint not available:', error);
            return null;
          }
        },

        // Task to cleanup test data
        async cleanupTestData() {
          try {
            const response = await fetch(`${apiBaseUrl}/test/cleanup`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) {
              console.log('Cleanup endpoint failed with status:', response.status);
              return null;
            }
            
            return response.json();
          } catch (error) {
            console.log('Cleanup endpoint not available:', error);
            return null;
          }
        },
        
        // Log task for debugging
        log(message: string) {
          console.log(message);
          return null;
        },
      });

      return config;
    },
  },
});
