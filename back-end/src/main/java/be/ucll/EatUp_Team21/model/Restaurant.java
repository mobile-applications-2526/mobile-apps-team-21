package be.ucll.EatUp_Team21.model;

import java.util.List;

import org.springframework.data.mongodb.core.mapping.DBRef;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

public class Restaurant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String naam;

    @NotNull
    public String adres;

    @NotNull
    public String Telefoonnummer;

    @NotNull
    public String Beschrijving;

    @DBRef
    private List<Groep> groep;

    @DBRef
    private List<RestRel> restRels;


    public Restaurant() {
    }

    public Restaurant(@NotNull String naam, @NotNull String adres, @NotNull String telefoonnummer,
            @NotNull String beschrijving) {
        this.naam = naam;
        this.adres = adres;
        Telefoonnummer = telefoonnummer;
        Beschrijving = beschrijving;
    }

    public Long getId() {
        return id;
    }

    public String getNaam() {
        return naam;
    }

    public String getAdres() {
        return adres;
    }

    public String getTelefoonnummer() {
        return Telefoonnummer;
    }

    public String getBeschrijving() {
        return Beschrijving;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }

    public void setAdres(String adres) {
        this.adres = adres;
    }

    public void setTelefoonnummer(String telefoonnummer) {
        Telefoonnummer = telefoonnummer;
    }

    public void setBeschrijving(String beschrijving) {
        Beschrijving = beschrijving;
    }
}
