package be.ucll.EatUp_Team21.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
import be.ucll.EatUp_Team21.controller.dto.RegisterRequest;
import be.ucll.EatUp_Team21.controller.dto.RegisterResponse;
import be.ucll.EatUp_Team21.controller.dto.UserResponse;
import be.ucll.EatUp_Team21.controller.dto.RestRelResponse;
import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.GroupVisit;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.model.Restaurant;
import be.ucll.EatUp_Team21.model.RestRel;
import be.ucll.EatUp_Team21.repository.UserRepository;
import be.ucll.EatUp_Team21.repository.GroupVisitRepository;
import be.ucll.EatUp_Team21.repository.RestRelRepository;
import be.ucll.EatUp_Team21.repository.RestaurantRepository;
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
    private GroupVisitRepository groupVisitRepository;

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

        // Count unique visited restaurants from group visits
        int visitedCount = 0;
        if (user.getGroups() != null) {
            Set<String> visitedRestaurantIds = new HashSet<>();
            for (Group group : user.getGroups()) {
                List<GroupVisit> visits = groupVisitRepository.findByGroup_Id(group.getId());
                for (GroupVisit visit : visits) {
                    visitedRestaurantIds.add(visit.getRestaurant().getId());
                }
            }
            visitedCount = visitedRestaurantIds.size();
        }

        int favoriteCount = 0;
        if (user.getRestaurantRelations() != null) {
            favoriteCount = (int) user.getRestaurantRelations().stream().filter(RestRel::isFavorite).count();
        }

        return new UserResponse(
                user.getName(),
                user.getFirstName(),
                user.getPhoneNumber(),
                user.getEmail(),
                visitedCount,
                favoriteCount);
    }

    public List<RestRelResponse> getFavoriteRestaurants(String email) {
        User user = userRepository.findUserByEmail(email);
        if (user.getRestaurantRelations() == null) return new ArrayList<>();
        return user.getRestaurantRelations().stream()
            .filter(RestRel::isFavorite)
            .map(r -> new RestRelResponse(r.getRestaurant().getId(), r.getRestaurant().getName(), r.getRestaurant().getAdress(), r.getVisitDate(), r.isFavorite(), r.getRating() >= 0 ? r.getRating() : null))
            .toList();
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

    public boolean toggleFavorite(String email, String restaurantId) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new IllegalArgumentException("Restaurant does not exist"));
        
        // Find existing relation or create new one
        RestRel relation = findOrCreateRestRel(user, restaurant);
        
        // Toggle favorite status
        relation.setFavorite(!relation.isFavorite());
        restRelRepository.save(relation);
        
        // Make sure the relation is in the user's list
        if (!user.getRestaurantRelations().contains(relation)) {
            user.addRestaurantRelation(relation);
            userRepository.save(user);
        }
        
        return relation.isFavorite();
    }

    public Map<String, Object> getRestaurantStatus(String email, String restaurantId) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }
        
        Map<String, Object> status = new HashMap<>();
        status.put("isFavorite", false);
        status.put("visitDate", "");
        status.put("rating", null);
        
        if (user.getRestaurantRelations() != null) {
            for (RestRel rel : user.getRestaurantRelations()) {
                if (rel.getRestaurant() != null && rel.getRestaurant().getId().equals(restaurantId)) {
                    status.put("isFavorite", rel.isFavorite());
                    status.put("visitDate", rel.getVisitDate() != null ? rel.getVisitDate().toString() : "");
                    status.put("rating", rel.getRating() >= 0 ? rel.getRating() : null);
                    break;
                }
            }
        }
        
        return status;
    }

    public Float setRating(String email, String restaurantId, Float rating) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new IllegalArgumentException("Restaurant does not exist"));
        
        // Find existing relation or create new one
        RestRel relation = findOrCreateRestRel(user, restaurant);
        
        // Set rating
        relation.setRating(rating);
        restRelRepository.save(relation);
        
        // Make sure the relation is in the user's list
        if (!user.getRestaurantRelations().contains(relation)) {
            user.addRestaurantRelation(relation);
            userRepository.save(user);
        }
        
        return relation.getRating() >= 0 ? relation.getRating() : null;
    }

    private RestRel findOrCreateRestRel(User user, Restaurant restaurant) {
        // Check if relation already exists
        if (user.getRestaurantRelations() != null) {
            for (RestRel rel : user.getRestaurantRelations()) {
                if (rel.getRestaurant() != null && rel.getRestaurant().getId().equals(restaurant.getId())) {
                    return rel;
                }
            }
        }
        
        // Create new relation
        RestRel newRel = new RestRel(user, restaurant);
        restRelRepository.save(newRel);
        return newRel;
    }
}
