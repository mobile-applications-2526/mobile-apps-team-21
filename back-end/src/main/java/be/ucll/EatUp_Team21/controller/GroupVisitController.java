package be.ucll.EatUp_Team21.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import be.ucll.EatUp_Team21.controller.dto.GroupVisitResponse;
import be.ucll.EatUp_Team21.controller.dto.UpdateGroupVisitRequest;
import be.ucll.EatUp_Team21.service.GroupVisitService;

@RestController
@RequestMapping("/visits")
public class GroupVisitController {

    @Autowired
    private GroupVisitService groupVisitService;

    /**
     * Get all group visits for the authenticated user
     */
    @GetMapping
    public ResponseEntity<List<GroupVisitResponse>> getUserGroupVisits(Authentication auth) {
        String email = auth.getName();
        List<GroupVisitResponse> visits = groupVisitService.getUserGroupVisits(email);
        return ResponseEntity.ok(visits);
    }

    /**
     * Get unique visited restaurants (for profile page - each restaurant appears once)
     */
    @GetMapping("/unique")
    public ResponseEntity<List<GroupVisitService.UniqueVisitedRestaurant>> getUniqueVisitedRestaurants(Authentication auth) {
        String email = auth.getName();
        List<GroupVisitService.UniqueVisitedRestaurant> restaurants = groupVisitService.getUniqueVisitedRestaurants(email);
        return ResponseEntity.ok(restaurants);
    }

    /**
     * Get all visited restaurant IDs (for checking if a restaurant is visited)
     */
    @GetMapping("/visited-ids")
    public ResponseEntity<Set<String>> getVisitedRestaurantIds(Authentication auth) {
        String email = auth.getName();
        Set<String> visitedIds = groupVisitService.getVisitedRestaurantIds(email);
        return ResponseEntity.ok(visitedIds);
    }

    /**
     * Get receipt image for a specific visit
     */
    @GetMapping("/{visitId}/receipt")
    public ResponseEntity<?> getReceiptImage(
            @PathVariable String visitId,
            Authentication auth) {
        String email = auth.getName();
        String receiptImage = groupVisitService.getReceiptImage(visitId, email);
        
        if (receiptImage == null || receiptImage.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(Map.of("receiptImage", receiptImage));
    }

    /**
     * Update a group visit (add receipt, price, payer info)
     */
    @PutMapping("/{visitId}")
    public ResponseEntity<GroupVisitResponse> updateGroupVisit(
            @PathVariable String visitId,
            @RequestBody UpdateGroupVisitRequest request,
            Authentication auth) {
        String email = auth.getName();
        GroupVisitResponse updated = groupVisitService.updateGroupVisit(visitId, request, email);
        return ResponseEntity.ok(updated);
    }
}
