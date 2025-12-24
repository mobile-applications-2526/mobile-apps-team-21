package be.ucll.EatUp_Team21.model;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.mapping.DBRef;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public class SuggestedRestaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @DBRef
    private Restaurant restaurant;

    // store recommender as email (principal name)
    private String recommenderEmail;

    // list of voter emails
    private List<String> voters = new ArrayList<>();

    private LocalDateTime recommendedAt = LocalDateTime.now();
    // when true, no further threshold notifications will be sent for this suggestion
    private boolean closed = false;

    public SuggestedRestaurant() {}

    public SuggestedRestaurant(Restaurant restaurant, String recommenderEmail) {
        this.restaurant = restaurant;
        this.recommenderEmail = recommenderEmail;
        this.voters = new ArrayList<>();
        this.recommendedAt = LocalDateTime.now();
        this.closed = false;
    }

    public String getId() { return id; }
    public Restaurant getRestaurant() { return restaurant; }
    public String getRecommenderEmail() { return recommenderEmail; }
    public List<String> getVoters() { return voters; }
    public LocalDateTime getRecommendedAt() { return recommendedAt; }
    public boolean isClosed() { return closed; }

    public void setId(String id) { this.id = id; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    public void setRecommenderEmail(String recommenderEmail) { this.recommenderEmail = recommenderEmail; }
    public void setVoters(List<String> voters) { this.voters = voters; }
    public void setRecommendedAt(LocalDateTime when) { this.recommendedAt = when; }
    public void setClosed(boolean closed) { this.closed = closed; }

    public void addVoter(String email) {
        if (email == null) return;
        if (!voters.contains(email)) voters.add(email);
    }

    public void removeVoter(String email) {
        if (email == null) return;
        voters.remove(email);
    }
}
