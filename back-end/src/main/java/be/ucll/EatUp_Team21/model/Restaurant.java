package be.ucll.EatUp_Team21.model;

import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Document(collection = "restaurants")
public class Restaurant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @NotNull
    private String name;

    @NotNull
    private String adress;

    private String phoneNumber;

    @NotNull
    private String description;


    public Restaurant() {
    }

    public Restaurant(@NotNull String name, @NotNull String adress, @NotNull String phoneNumber,
            @NotNull String description) {
        this.name = name;
        this.adress = adress;
        this.phoneNumber = phoneNumber;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAdress() {
        return adress;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAdress(String adress) {
        this.adress = adress;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
