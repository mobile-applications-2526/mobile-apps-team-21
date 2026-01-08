package be.ucll.EatUp_Team21.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import be.ucll.EatUp_Team21.controller.dto.GroupVisitResponse;
import be.ucll.EatUp_Team21.controller.dto.UpdateGroupVisitRequest;
import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.GroupVisit;
import be.ucll.EatUp_Team21.model.RestRel;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.repository.GroupVisitRepository;
import be.ucll.EatUp_Team21.repository.UserRepository;

@Service
public class GroupVisitService {

    @Autowired
    private GroupVisitRepository groupVisitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageStorageService imageStorageService;

    /**
     * Get all group visits for a user (visits from groups they are a member of)
     */
    public List<GroupVisitResponse> getUserGroupVisits(String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }

        List<GroupVisitResponse> responses = new ArrayList<>();
        List<Group> userGroups = user.getGroups();
        
        if (userGroups == null || userGroups.isEmpty()) {
            return responses;
        }

        for (Group group : userGroups) {
            List<GroupVisit> visits = groupVisitRepository.findByGroup_Id(group.getId());
            for (GroupVisit visit : visits) {
                // Get user's personal rating for this restaurant
                Float userRating = getUserRatingForRestaurant(user, visit.getRestaurant().getId());
                
                responses.add(new GroupVisitResponse(
                    visit.getId(),
                    visit.getRestaurant().getId(),
                    visit.getRestaurant().getName(),
                    visit.getRestaurant().getAdress(),
                    visit.getGroup().getId(),
                    visit.getGroup().getName(),
                    visit.getVisitDate(),
                    visit.getTotalPrice(),
                    visit.getPaidByEmail(),
                    visit.getPaidByName(),
                    visit.getCuisine(),
                    visit.getReceiptImage() != null && !visit.getReceiptImage().isEmpty(),
                    userRating
                ));
            }
        }

        // Sort by visit date descending (most recent first)
        responses.sort((a, b) -> {
            if (a.visitDate() == null && b.visitDate() == null) return 0;
            if (a.visitDate() == null) return 1;
            if (b.visitDate() == null) return -1;
            return b.visitDate().compareTo(a.visitDate());
        });

        return responses;
    }

    /**
     * Get the receipt image for a group visit
     */
    public String getReceiptImage(String visitId, String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }

        GroupVisit visit = groupVisitRepository.findById(visitId)
            .orElseThrow(() -> new IllegalArgumentException("Visit not found"));

        // Verify user is a member of the group
        boolean isMember = user.getGroups() != null && 
            user.getGroups().stream().anyMatch(g -> g.getId().equals(visit.getGroup().getId()));
        
        if (!isMember) {
            throw new IllegalArgumentException("User is not a member of this group");
        }

        return visit.getReceiptImage();
    }

    /**
     * Update a group visit (add receipt, price, payer info)
     */
    public GroupVisitResponse updateGroupVisit(String visitId, UpdateGroupVisitRequest request, String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }

        GroupVisit visit = groupVisitRepository.findById(visitId)
            .orElseThrow(() -> new IllegalArgumentException("Visit not found"));

        // Verify user is a member of the group
        boolean isMember = user.getGroups() != null && 
            user.getGroups().stream().anyMatch(g -> g.getId().equals(visit.getGroup().getId()));
        
        if (!isMember) {
            throw new IllegalArgumentException("User is not a member of this group");
        }

        // Update fields if provided
        if (request.totalPrice() != null) {
            visit.setTotalPrice(request.totalPrice());
        }
        if (request.paidByEmail() != null) {
            visit.setPaidByEmail(request.paidByEmail());
        }
        if (request.paidByName() != null) {
            visit.setPaidByName(request.paidByName());
        }
        if (request.receiptImage() != null && !request.receiptImage().isEmpty()) {
        // Only upload to Blob Storage if the incoming string looks like a new Base64 upload
        if (request.receiptImage().startsWith("data:image")) {
            String imageUrl = imageStorageService.uploadBase64Image(request.receiptImage());
            visit.setReceiptImage(imageUrl); // Store the URL instead of the Base64 string
        } else {
            // If it's already a URL, just save it
            visit.setReceiptImage(request.receiptImage());
        }
    }

    groupVisitRepository.save(visit);

        Float userRating = getUserRatingForRestaurant(user, visit.getRestaurant().getId());

        return new GroupVisitResponse(
            visit.getId(),
            visit.getRestaurant().getId(),
            visit.getRestaurant().getName(),
            visit.getRestaurant().getAdress(),
            visit.getGroup().getId(),
            visit.getGroup().getName(),
            visit.getVisitDate(),
            visit.getTotalPrice(),
            visit.getPaidByEmail(),
            visit.getPaidByName(),
            visit.getCuisine(),
            visit.getReceiptImage() != null && !visit.getReceiptImage().isEmpty(),
            userRating
        );
    }

    /**
     * Get unique visited restaurants from group visits (for profile page)
     * Each restaurant appears only once, with the most recent visit date
     */
    public List<UniqueVisitedRestaurant> getUniqueVisitedRestaurants(String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }

        List<Group> userGroups = user.getGroups();
        if (userGroups == null || userGroups.isEmpty()) {
            return new ArrayList<>();
        }

        // Use a map to track unique restaurants by ID, keeping the most recent visit
        Map<String, UniqueVisitedRestaurant> restaurantMap = new HashMap<>();

        for (Group group : userGroups) {
            List<GroupVisit> visits = groupVisitRepository.findByGroup_Id(group.getId());
            for (GroupVisit visit : visits) {
                String restaurantId = visit.getRestaurant().getId();
                Float userRating = getUserRatingForRestaurant(user, restaurantId);
                
                UniqueVisitedRestaurant existing = restaurantMap.get(restaurantId);
                if (existing == null || 
                    (visit.getVisitDate() != null && 
                     (existing.visitDate() == null || visit.getVisitDate().isAfter(existing.visitDate())))) {
                    restaurantMap.put(restaurantId, new UniqueVisitedRestaurant(
                        restaurantId,
                        visit.getRestaurant().getName(),
                        visit.getRestaurant().getAdress(),
                        visit.getVisitDate(),
                        userRating
                    ));
                }
            }
        }

        // Convert to list and sort by visit date descending
        List<UniqueVisitedRestaurant> result = new ArrayList<>(restaurantMap.values());
        result.sort((a, b) -> {
            if (a.visitDate() == null && b.visitDate() == null) return 0;
            if (a.visitDate() == null) return 1;
            if (b.visitDate() == null) return -1;
            return b.visitDate().compareTo(a.visitDate());
        });

        return result;
    }

    /**
     * Get all unique restaurant IDs that the user has visited through group visits
     */
    public Set<String> getVisitedRestaurantIds(String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }

        Set<String> visitedIds = new HashSet<>();
        List<Group> userGroups = user.getGroups();
        
        if (userGroups == null || userGroups.isEmpty()) {
            return visitedIds;
        }

        for (Group group : userGroups) {
            List<GroupVisit> visits = groupVisitRepository.findByGroup_Id(group.getId());
            for (GroupVisit visit : visits) {
                visitedIds.add(visit.getRestaurant().getId());
            }
        }

        return visitedIds;
    }

    /**
     * Helper method to get user's rating for a restaurant
     */
    private Float getUserRatingForRestaurant(User user, String restaurantId) {
        if (user.getRestaurantRelations() == null) {
            return null;
        }
        
        return user.getRestaurantRelations().stream()
            .filter(rel -> rel.getRestaurant().getId().equals(restaurantId))
            .findFirst()
            .map(RestRel::getRating)
            .filter(rating -> rating >= 0)
            .orElse(null);
    }

    /**
     * DTO for unique visited restaurant (for profile page)
     */
    public record UniqueVisitedRestaurant(
        String restaurantId,
        String restaurantName,
        String restaurantAddress,
        java.time.LocalDate visitDate,
        Float rating
    ) {}
}
