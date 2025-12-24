package be.ucll.EatUp_Team21.model;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Document(collection = "restRels")
public class RestRel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @NotNull
    private User user;

    @NotNull
    private Restaurant restaurant;

    private Float rating;

    private boolean wantsToGo = false;

    private boolean isFavorite = false;

    private boolean hasVisited = false;

    private LocalDateTime visitedDate;

    public RestRel() {
    }

    public RestRel(@NotNull User user, @NotNull Restaurant restaurant) {
        this.user = user;
        this.restaurant = restaurant;
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public float getRating() {
        if (rating != null) {
            return rating;
        }
        return -1.0f;
    }

    public boolean getWantsToGo() {
        return wantsToGo;
    }

    public String setRating(Float rating) {
        if (rating < 0.0f || rating > 5.0f) {
            return "Rating must be between 0.0 and 5.0";
        }
        this.rating = rating;
        return "Rating van " + restaurant.getName() + " is gezet op " + rating;
    }

    public void wantsToGo() {
        this.wantsToGo = true;
    }

    public void doesNotWantToGo() {
        this.wantsToGo = false;
    }

    public boolean isFavorite() {
        return isFavorite;
    }

    public void setFavorite(boolean favorite) {
        this.isFavorite = favorite;
    }

    public boolean hasVisited() {
        return hasVisited;
    }

    public void setHasVisited(boolean hasVisited) {
        this.hasVisited = hasVisited;
    }

    public LocalDateTime getVisitedDate() {
        return visitedDate;
    }

    public void setVisitedDate(LocalDateTime visitedDate) {
        this.visitedDate = visitedDate;
    }

    public void markAsVisited() {
        this.hasVisited = true;
        this.visitedDate = LocalDateTime.now();
    }
}
