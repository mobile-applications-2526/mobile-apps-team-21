package be.ucll.EatUp_Team21.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

public class RestRel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @NotNull
    public Persoon persoon;

    @NotNull
    public Restaurant restaurant;

    private Float rating;

    private boolean wilGaan = false;

    public RestRel() {
    }

    public RestRel(@NotNull Persoon persoon, @NotNull Restaurant restaurant) {
        this.persoon = persoon;
        this.restaurant = restaurant;
    }

    public String getId() {
        return id;
    }

    public Persoon getPersoon() {
        return persoon;
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

    public boolean getWilGaan() {
        return wilGaan;
    }

    public String setRating(Float rating) {
        if (rating < 0.0f || rating > 5.0f) {
            return "Rating must be between 0.0 and 5.0";
        }
        this.rating = rating;
        return "Rating van " + restaurant.getNaam() + " is gezet op " + rating;
    }

    public void WilGaan() {
        this.wilGaan = true;
    }

    public void WilNietGaan() {
        this.wilGaan = false;
    }
}
