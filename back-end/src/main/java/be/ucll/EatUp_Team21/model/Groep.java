package be.ucll.EatUp_Team21.model;

import java.util.List;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Document(collection = "groepen")
public class Groep {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String naam;

    @DBRef
    private List<Persoon> leden;

    @DBRef
    private List<Restaurant> voorgesteldeRestaurants;

    public Groep() {
    }

    public Groep(@NotNull String naam) {
        this.naam = naam;
    }

    public Long getId() {
        return id;
    }

    public String getNaam() {
        return naam;
    }

    public List<Persoon> getLeden() {
        return leden;
    }

    public List<Restaurant> getVoorgesteldeRestaurants() {
        return voorgesteldeRestaurants;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }

    public void setLeden(List<Persoon> leden) {
        this.leden = leden;
    }

    public void setVoorgesteldeRestaurants(List<Restaurant> voorgesteldeRestaurants) {
        this.voorgesteldeRestaurants = voorgesteldeRestaurants;
    }

    public void addLid(Persoon persoon) {
        this.leden.add(persoon);
    }

    public void addVoorgesteldRestaurant(Restaurant restGroep) {
        this.voorgesteldeRestaurants.add(restGroep);
    }
}
