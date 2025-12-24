package be.ucll.EatUp_Team21.service;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
import be.ucll.EatUp_Team21.controller.dto.ProfileStatsResponse;
import be.ucll.EatUp_Team21.controller.dto.RegisterRequest;
import be.ucll.EatUp_Team21.controller.dto.RegisterResponse;
import be.ucll.EatUp_Team21.controller.dto.RestaurantRelationResponse;
import be.ucll.EatUp_Team21.controller.dto.UserResponse;
import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.RestRel;
import be.ucll.EatUp_Team21.model.Restaurant;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.repository.RestRelRepository;
import be.ucll.EatUp_Team21.repository.RestaurantRepository;
import be.ucll.EatUp_Team21.repository.UserRepository;
import be.ucll.EatUp_Team21.security.JwtUtil;
import be.ucll.EatUp_Team21.repository.MessageRepository;
import be.ucll.EatUp_Team21.security.SecurityConfig;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private RestRelRepository restRelRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private SecurityConfig securityConfig;

    @Autowired
    private JwtUtil jwtUtil;

    public List<GroupResponse> getUserGroups(String email) {
        User user = userRepository.findUserByEmail(email);
        return user.getGroups().stream()
                .map(group -> {
                    // determine last visited time for this user for the group
                    LocalDateTime lastVisited = null;
                    if (group.getMemberLastVisited() != null) {
                        lastVisited = group.getMemberLastVisited().get(user.getId());
                    }
                    if (lastVisited == null) {
                        // if never visited, set a safe epoch fallback (avoid LocalDateTime.MIN which
                        // isn't supported by java.util.Date)
                        lastVisited = LocalDateTime.of(1970, 1, 1, 0, 0);
                    }
                    long missed = messageRepository.countByGroup_IdAndTimestampAfter(group.getId(), lastVisited);
                    return new GroupResponse(group.getId(), group.getName(), (int) missed);
                })
                .toList();
    }

    public boolean isUserMemberOfGroup(String senderEmail, String id) {
        User user = userRepository.findUserByEmail(senderEmail);
        if (user != null && user.getGroups() != null) {
            return user.getGroups().stream()
                    .anyMatch(group -> group.getId() != null && group.getId().equals(id));
        }
        return false;
    }

    public User getUserByEmail(String senderEmail) {
        return userRepository.findUserByEmail(senderEmail);
    }

    public boolean userExists(String email) {
        return userRepository.findUserByEmail(email) != null;
    }

    public void addGroupToUser(User user, Group newGroup) {
        user.addGroup(newGroup);
        userRepository.save(user);
    }

    public RegisterResponse registerUser(RegisterRequest req) {
        if (userExists(req.email())) {
            throw new IllegalArgumentException("User with email " + req.email() + " already exists");
        }
        User newUser = new User(req.name(), req.firstName(), req.phoneNumber(), req.email(),
                securityConfig.passwordEncoder().encode(req.password()));
        userRepository.save(newUser);
        // Generate token for newly registered user so they can be logged in immediately
        // (implementation not shown here)
        String token = jwtUtil.generateToken(newUser.getEmail());
        return new RegisterResponse(newUser.getId(), token);

    }

    public UserResponse getSelf(String email, Authentication auth) {
        if (!email.equals(auth.getName())) {
            throw new IllegalArgumentException("Bad Credentials for request");
        }
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }
        return new UserResponse(
                user.getName(),
                user.getFirstName(),
                user.getPhoneNumber(),
                user.getEmail());
    }

    public List<String> modifySelf(RegisterRequest req, String name, String email) {
        List<String> res = new ArrayList<String>();
        if(!email.equals(name)){
            throw new IllegalArgumentException("User is not permitted to do this operation.");
        }
        User user = userRepository.findUserByEmail(email);
        if(user == null){
            throw new IllegalArgumentException("User does not exist");
        }
        if(req.name() != null && !(req.name().isEmpty())){
            user.setName(req.name());
            res.add("Name succesfully changed.");
        }
        if(req.firstName() != null && !(req.firstName().isEmpty())){
            user.setFirstName(req.firstName());
            res.add("Firstname succesfully changed.");
        }
        if(req.phoneNumber() != null && !(req.phoneNumber().isEmpty())){
            user.setPhoneNumber(req.phoneNumber());
            res.add("Phone number succesfully changed.");
        }
        if(req.password() != null && !(req.password().isEmpty())){
            user.setPassword(
                securityConfig.passwordEncoder().encode(req.password())
            );
            res.add("Password sucesfully changed.");
        }
        userRepository.save(user);
        return res;
    }

    // Get profile statistics (visited and favorite restaurants counts)
    public ProfileStatsResponse getProfileStats(String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }
        
        List<RestRel> relations = user.getRestaurantRelations();
        if (relations == null) {
            return new ProfileStatsResponse(0, 0);
        }
        
        int visitedCount = (int) relations.stream().filter(RestRel::hasVisited).count();
        int favoriteCount = (int) relations.stream().filter(RestRel::isFavorite).count();
        
        return new ProfileStatsResponse(visitedCount, favoriteCount);
    }

    // Get visited restaurants
    public List<RestaurantRelationResponse> getVisitedRestaurants(String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }
        
        List<RestRel> relations = user.getRestaurantRelations();
        if (relations == null) {
            return new ArrayList<>();
        }
        
        return relations.stream()
            .filter(RestRel::hasVisited)
            .map(this::mapToRestaurantRelationResponse)
            .toList();
    }

    // Get favorite restaurants
    public List<RestaurantRelationResponse> getFavoriteRestaurants(String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }
        
        List<RestRel> relations = user.getRestaurantRelations();
        if (relations == null) {
            return new ArrayList<>();
        }
        
        return relations.stream()
            .filter(RestRel::isFavorite)
            .map(this::mapToRestaurantRelationResponse)
            .toList();
    }

    // Toggle favorite status for a restaurant
    public RestaurantRelationResponse toggleFavorite(String email, String restaurantId) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new IllegalArgumentException("Restaurant does not exist"));
        
        List<RestRel> relations = user.getRestaurantRelations();
        if (relations == null) {
            relations = new ArrayList<>();
            user.setRestaurantRelations(relations);
        }
        
        RestRel existingRel = relations.stream()
            .filter(r -> r.getRestaurant() != null && r.getRestaurant().getId().equals(restaurantId))
            .findFirst()
            .orElse(null);
        
        if (existingRel == null) {
            existingRel = new RestRel(user, restaurant);
            existingRel.setFavorite(true);
            existingRel = restRelRepository.save(existingRel);
            relations.add(existingRel);
        } else {
            existingRel.setFavorite(!existingRel.isFavorite());
            existingRel = restRelRepository.save(existingRel);
        }
        
        userRepository.save(user);
        return mapToRestaurantRelationResponse(existingRel);
    }

    // Mark a restaurant as visited
    public RestaurantRelationResponse markAsVisited(String email, String restaurantId) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new IllegalArgumentException("Restaurant does not exist"));
        
        List<RestRel> relations = user.getRestaurantRelations();
        if (relations == null) {
            relations = new ArrayList<>();
            user.setRestaurantRelations(relations);
        }
        
        RestRel existingRel = relations.stream()
            .filter(r -> r.getRestaurant() != null && r.getRestaurant().getId().equals(restaurantId))
            .findFirst()
            .orElse(null);
        
        if (existingRel == null) {
            existingRel = new RestRel(user, restaurant);
            existingRel.markAsVisited();
            existingRel = restRelRepository.save(existingRel);
            relations.add(existingRel);
        } else {
            existingRel.markAsVisited();
            existingRel = restRelRepository.save(existingRel);
        }
        
        userRepository.save(user);
        return mapToRestaurantRelationResponse(existingRel);
    }

    // Helper method to map RestRel to DTO
    private RestaurantRelationResponse mapToRestaurantRelationResponse(RestRel rel) {
        Restaurant r = rel.getRestaurant();
        return new RestaurantRelationResponse(
            rel.getId(),
            r != null ? r.getId() : null,
            r != null ? r.getName() : null,
            r != null ? r.getAdress() : null,
            r != null ? r.getDescription() : null,
            r != null ? r.getPhoneNumber() : null,
            rel.getRating() >= 0 ? rel.getRating() : null,
            rel.isFavorite(),
            rel.hasVisited(),
            rel.getVisitedDate()
        );
    }
}
