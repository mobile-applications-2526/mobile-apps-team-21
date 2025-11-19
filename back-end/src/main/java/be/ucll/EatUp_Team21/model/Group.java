package be.ucll.EatUp_Team21.model;

import java.util.List;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Document(collection = "groepen")
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

    public Group() {
    }

    public Group(@NotNull String name) {
        this.name = name;
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
