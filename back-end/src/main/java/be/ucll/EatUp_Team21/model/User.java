package be.ucll.EatUp_Team21.model;

import java.util.List;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

@Document(collection = "users")
@JsonIgnoreProperties(value = { "password", "groups", "restaurantRelations" })
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @NotNull
    private String name;

    @NotNull
    private String firstName;

    private String phoneNumber;

    @Column(unique = true)
    @Email
    @NotNull
    private String email;

    @NotNull
    private String password;

    @DBRef
    private List<Group> groups;

    @DBRef 
    private List<RestRel> restaurantRelations;

    public User() {
    }

    public User(
            @NotNull String name, 
            @NotNull String firstName, 
            String phoneNumber, 
            @Email @NotNull String email, 
            @NotNull String password) {
        this.name = name;
        this.firstName = firstName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
        this.restaurantRelations = new java.util.ArrayList<>();
        this.groups = new java.util.ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    @JsonIgnore
    public String getPassword() {
        return password;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<RestRel> getRestaurantRelations() {
        return restaurantRelations;
    }

    public void setRestaurantRelations(List<RestRel> restaurantRelations) {
        this.restaurantRelations = restaurantRelations;
    }

    public void addRestaurantRelation(RestRel restRel) {
        this.restaurantRelations.add(restRel);
    }

    public String removeRestaurantRelation(RestRel restRel) {
        if(this.restaurantRelations.remove(restRel)) {
            return "Relatie verwijderd.";
        } else {
            return "Relatie niet gevonden.";
        }
    }

    public List<Group> getGroups() {
        return groups;
    }

    public void setGroups(List<Group> groups) {
        this.groups = groups;
    }

    public void addGroup(Group group) {
        this.groups.add(group);
    }

    public String removeGroup(Group group) {
        if(this.groups.remove(group)) {
            return "Groep verwijderd.";
        } else {
            return "Groep niet gevonden.";
        }
    }
}
