package be.ucll.EatUp_Team21.model;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Document(collection = "groups")
public class Group {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @NotNull
    private String name;

    @DBRef
    private List<User> members;

    @DBRef
    private List<Restaurant> suggestedRestaurants;

    // track when each member last visited this group (key = userId)
    private Map<String, LocalDateTime> memberLastVisited = new HashMap<>();

    public Group() {
    }

    public Group(@NotNull String name) {
        this.name = name;
        this.members = new java.util.ArrayList<>();
        this.suggestedRestaurants = new java.util.ArrayList<>();
        this.memberLastVisited = new HashMap<>();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<User> getMembers() {
        return members;
    }

    public List<Restaurant> getSuggestedRestaurants() {
        return suggestedRestaurants;
    }

    public Map<String, LocalDateTime> getMemberLastVisited() {
        return memberLastVisited;
    }

    public void setMemberLastVisited(Map<String, LocalDateTime> memberLastVisited) {
        this.memberLastVisited = memberLastVisited;
    }

    public void updateMemberLastVisited(String userId, LocalDateTime when) {
        this.memberLastVisited.put(userId, when);
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setMembers(List<User> members) {
        this.members = members;
    }

    public void setSuggestedRestaurants(List<Restaurant> suggestedRestaurants) {
        this.suggestedRestaurants = suggestedRestaurants;
    }

    public void addMember(User member) {
        this.members.add(member);
    }

    public void addSuggestedRestaurant(Restaurant suggestedRestaurant) {
        this.suggestedRestaurants.add(suggestedRestaurant);
    }
}
