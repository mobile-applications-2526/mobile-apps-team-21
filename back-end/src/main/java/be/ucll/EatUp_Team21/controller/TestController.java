package be.ucll.EatUp_Team21.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import be.ucll.EatUp_Team21.model.*;
import be.ucll.EatUp_Team21.repository.*;
import be.ucll.EatUp_Team21.repository.seeds.DatabaseSeeder;

import java.util.*;

/**
 * Test Controller - ONLY AVAILABLE IN DEV/TEST PROFILE
 * 
 * This controller provides endpoints for E2E testing purposes:
 * - Reset database (clear + reseed using DatabaseSeeder)
 * - Seed test data
 * - Clean up test data
 * 
 * IMPORTANT: This controller should NEVER be enabled in production!
 * Make sure to use Spring profiles correctly.
 */
@RestController
@RequestMapping("/test")
@Profile({"dev", "test"})
public class TestController {

    private final DatabaseSeeder databaseSeeder;
    private final UserRepository userRepository;

    public TestController(DatabaseSeeder databaseSeeder, UserRepository userRepository) {
        this.databaseSeeder = databaseSeeder;
        this.userRepository = userRepository;
    }

    /**
     * Reset the test database - clears all data and reseeds using DatabaseSeeder
     */
    @PostMapping("/reset-database")
    public ResponseEntity<Map<String, Object>> resetDatabase() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            databaseSeeder.clearAll();
            databaseSeeder.seedAll();
            
            response.put("success", true);
            response.put("message", "Database reset and reseeded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Database reset failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Seed test data based on type
     */
    @PostMapping("/seed")
    public ResponseEntity<Map<String, Object>> seedTestData(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String type = request.getOrDefault("type", "all");
        
        try {
            switch (type) {
                case "users":
                    databaseSeeder.seedUsers();
                    break;
                case "restaurants":
                    databaseSeeder.seedRestaurants();
                    break;
                case "groups":
                    databaseSeeder.seedGroups();
                    break;
                case "all":
                    databaseSeeder.seedAll();
                    break;
                default:
                    response.put("success", false);
                    response.put("message", "Unknown seed type: " + type);
                    return ResponseEntity.badRequest().body(response);
            }
            
            response.put("success", true);
            response.put("message", "Test data seeded successfully for type: " + type);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Seeding failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Clean up test data created during tests
     * Removes users with test email patterns (not part of seed data)
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupTestData() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Delete users created during tests (emails containing timestamps or test patterns)
            List<User> testUsers = userRepository.findAll().stream()
                .filter(u -> u.getEmail() != null && 
                    (u.getEmail().contains("test.user.") || 
                     u.getEmail().contains("flow.test.") ||
                     u.getEmail().contains("loading.test.") ||
                     u.getEmail().contains("cypress.test")))
                .toList();
            
            userRepository.deleteAll(testUsers);
            
            response.put("success", true);
            response.put("message", "Cleaned up " + testUsers.size() + " test users");
            response.put("deletedCount", testUsers.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Cleanup failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Health check for test endpoints
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("profile", "dev/test");
        response.put("message", "Test endpoints are available");
        response.put("database", "Eat-Up");
        return ResponseEntity.ok(response);
    }
}
