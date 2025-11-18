package be.ucll.EatUp_Team21.model;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Document(collection = "berichten")
public class Bericht {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String tekst;

    private LocalDateTime timestamp;

    @NotNull
    private Persoon auteur;

    @NotNull
    private Groep groep;

    private boolean isEdited = false;

    public Bericht() {
    }

    public Bericht(@NotNull String tekst, @NotNull Persoon auteur, Groep groep) {
        this.tekst = tekst;
        this.timestamp = LocalDateTime.now();
        this.auteur = auteur;
        this.groep = groep;
    }

    public Long getId() {
        return id;
    }

    public String getTekst() {
        return tekst;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTekst(String tekst) {
        this.tekst = tekst;
        this.timestamp = LocalDateTime.now();
        this.isEdited = true;
    }
}
