package be.ucll.EatUp_Team21.model;

import java.util.List;

import org.springframework.data.mongodb.core.aggregation.ComparisonOperators.Eq;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

@Document(collection = "personen")
public class Persoon {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @NotNull
    private String naam;

    @NotNull
    private String voornaam;

    private String telefoonnummer;

    @Column(unique = true)
    @Email
    @NotNull
    private String email;

    @NotNull
    private String wachtwoord;

    @DBRef
    private List<Groep> Groepen;

    @DBRef 
    private List<RestRel> RestaurantRelaties;

    public Persoon() {
    }

    public Persoon(
            @NotNull String naam, 
            @NotNull String voornaam, 
            String telefoonnummer, 
            @Email @NotNull String email, 
            @NotNull String wachtwoord) {
        this.naam = naam;
        this.voornaam = voornaam;
        this.telefoonnummer = telefoonnummer;
        this.email = email;
        this.wachtwoord = wachtwoord;
    }

    public String getId() {
        return id;
    }

    public String getNaam() {
        return naam;
    }

    public String getVoornaam() {
        return voornaam;
    }

    public String getTelefoonnummer() {
        return telefoonnummer;
    }

    public String getEmail() {
        return email;
    }

    public String getWachtwoord() {
        return wachtwoord;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }

    public void setVoornaam(String voornaam) {
        this.voornaam = voornaam;
    }

    public void setTelefoonnummer(String telefoonnummer) {
        this.telefoonnummer = telefoonnummer;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setWachtwoord(String wachtwoord) {
        this.wachtwoord = wachtwoord;
    }

    public List<RestRel> getRestaurantRelaties() {
        return RestaurantRelaties;
    }

    public void setRestaurantRelaties(List<RestRel> restaurantRelaties) {
        RestaurantRelaties = restaurantRelaties;
    }

    public void addRestaurantRelatie(RestRel restRel) {
        this.RestaurantRelaties.add(restRel);
    }

    public String removeRestaurantRelatie(RestRel restRel) {
        if(this.RestaurantRelaties.remove(restRel)) {
            return "Relatie verwijderd.";
        } else {
            return "Relatie niet gevonden.";
        }
    }

    public List<Groep> getGroepen() {
        return Groepen;
    }

    public void setGroepen(List<Groep> groepen) {
        Groepen = groepen;
    }

    public void addGroep(Groep groep) {
        this.Groepen.add(groep);
    }

    public String removeGroep(Groep groep) {
        if(this.Groepen.remove(groep)) {
            return "Groep verwijderd.";
        } else {
            return "Groep niet gevonden.";
        }
    }
}
