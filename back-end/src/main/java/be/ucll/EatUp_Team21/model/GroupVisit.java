package be.ucll.EatUp_Team21.model;

import java.time.LocalDate;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

/**
 * Represents a group visit to a restaurant.
 * This captures when a group actually went to a restaurant together,
 * including receipt information and payment details.
 */
@Document(collection = "groupVisits")
public class GroupVisit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @NotNull
    @DBRef
    private Group group;

    @NotNull
    @DBRef
    private Restaurant restaurant;

    @NotNull
    private LocalDate visitDate;

    // Receipt image as Base64 string (can be null if not uploaded yet)
    private String receiptImage;

    // Total bill amount (can be null if not entered yet)
    private Double totalPrice;

    // Email of the person who paid
    private String paidByEmail;

    // Name of the person who paid (for display purposes)
    private String paidByName;

    // Cuisine type from the restaurant (for filtering)
    private String cuisine;

    public GroupVisit() {
    }

    public GroupVisit(@NotNull Group group, @NotNull Restaurant restaurant, @NotNull LocalDate visitDate) {
        this.group = group;
        this.restaurant = restaurant;
        this.visitDate = visitDate;
    }

    // Getters
    public String getId() {
        return id;
    }

    public Group getGroup() {
        return group;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public String getReceiptImage() {
        return receiptImage;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public String getPaidByEmail() {
        return paidByEmail;
    }

    public String getPaidByName() {
        return paidByName;
    }

    public String getCuisine() {
        return cuisine;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public void setReceiptImage(String receiptImage) {
        this.receiptImage = receiptImage;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public void setPaidByEmail(String paidByEmail) {
        this.paidByEmail = paidByEmail;
    }

    public void setPaidByName(String paidByName) {
        this.paidByName = paidByName;
    }

    public void setCuisine(String cuisine) {
        this.cuisine = cuisine;
    }
}
