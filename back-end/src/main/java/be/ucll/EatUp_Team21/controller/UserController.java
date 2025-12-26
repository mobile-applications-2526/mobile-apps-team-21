package be.ucll.EatUp_Team21.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
import be.ucll.EatUp_Team21.controller.dto.RegisterRequest;
import be.ucll.EatUp_Team21.controller.dto.RegisterResponse;
import be.ucll.EatUp_Team21.controller.dto.UserResponse;
import be.ucll.EatUp_Team21.controller.dto.RestRelResponse;
import be.ucll.EatUp_Team21.service.NotificationService;
import be.ucll.EatUp_Team21.service.UserService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/groups")
    public List<GroupResponse> getUserGroups(@RequestParam String email, Authentication param) {
        if (email != null && param.getName().equals(email)) {
            return userService.getUserGroups(email);
        }
        throw new IllegalArgumentException("Email in request does not match authenticated user");
    }

    @PostMapping("/register")
    public RegisterResponse registerUser(@RequestBody RegisterRequest req) {
        return userService.registerUser(req);
    }

    @GetMapping()
    public UserResponse getSelf(@RequestParam String email, Authentication auth) {
        return userService.getSelf(email, auth);
    }

    @PutMapping()
    public List<String> changeCredentials(@RequestBody RegisterRequest req, @RequestParam String email,
            Authentication auth) {
        return userService.modifySelf(req, auth.getName(), email);
    }

    @GetMapping("/favorites")
    public List<RestRelResponse> getFavoriteRestaurants(@RequestParam String email, Authentication auth) {
        if (!email.equals(auth.getName())) {
            throw new IllegalArgumentException("Bad Credentials for request");
        }
        return userService.getFavoriteRestaurants(email);
    }
    
    @PostMapping("/push-token")
    public ResponseEntity<?> updatePushToken(
            @RequestBody Map<String, String> body,
            Authentication authHeader) {
        String pushToken = body.get("pushToken");
        String email = authHeader.getName(); // Your JWT extraction logic

        notificationService.updateUserPushToken(email, pushToken);

        return ResponseEntity.ok().body(Map.of("message", "Push token updated"));
    }

    @PostMapping("/restaurants/{restaurantId}/favorite")
    public ResponseEntity<?> toggleFavorite(
            @PathVariable String restaurantId,
            Authentication auth) {
        String email = auth.getName();
        boolean isFavorite = userService.toggleFavorite(email, restaurantId);
        return ResponseEntity.ok().body(Map.of("isFavorite", isFavorite));
    }

    @GetMapping("/restaurants/{restaurantId}/status")
    public ResponseEntity<?> getRestaurantStatus(
            @PathVariable String restaurantId,
            Authentication auth) {
        String email = auth.getName();
        Map<String, Object> status = userService.getRestaurantStatus(email, restaurantId);
        return ResponseEntity.ok().body(status);
    }

    @PostMapping("/restaurants/{restaurantId}/rating")
    public ResponseEntity<?> setRating(
            @PathVariable String restaurantId,
            @RequestBody Map<String, Float> body,
            Authentication auth) {
        String email = auth.getName();
        Float rating = body.get("rating");
        if (rating == null || rating < 0 || rating > 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rating must be between 0 and 5"));
        }
        Float newRating = userService.setRating(email, restaurantId, rating);
        return ResponseEntity.ok().body(Map.of("rating", newRating));
    }

}
