package be.ucll.EatUp_Team21.model;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;

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

    // availability per voter: email -> list of available dates
    private Map<String, List<LocalDate>> availabilities = new HashMap<>();

    // locked visit date once all voters provided availability
    private LocalDate lockedDate = null;

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
    public Map<String, List<LocalDate>> getAvailabilities() { return availabilities; }
    public LocalDate getLockedDate() { return lockedDate; }

    public void setId(String id) { this.id = id; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    public void setRecommenderEmail(String recommenderEmail) { this.recommenderEmail = recommenderEmail; }
    public void setVoters(List<String> voters) { this.voters = voters; }
    public void setRecommendedAt(LocalDateTime when) { this.recommendedAt = when; }
    public void setClosed(boolean closed) { this.closed = closed; }
    public void setAvailabilities(Map<String, List<LocalDate>> availabilities) { this.availabilities = availabilities; }
    public void setLockedDate(LocalDate date) { this.lockedDate = date; }

    public void addVoter(String email) {
        if (email == null) return;
        if (!voters.contains(email)) voters.add(email);
    }

    public void removeVoter(String email) {
        if (email == null) return;
        voters.remove(email);
    }

    /**
     * Save availability list (dates) for given user email.
     */
    public void setAvailabilityForUser(String email, List<LocalDate> dates) {
        if (email == null) return;
        String key = sanitizeKey(email);
        if (dates == null) {
            availabilities.remove(key);
            return;
        }
        List<LocalDate> unique = new ArrayList<>();
        for (LocalDate d : dates) {
            if (d != null && !unique.contains(d)) unique.add(d);
        }
        availabilities.put(key, unique);
    }

    private String sanitizeKey(String email) {
        return email.replace(".", "__DOT__");
    }

    private String unsanitizeKey(String key) {
        return key.replace("__DOT__", ".");
    }

    /**
     * Expose availabilities with unsanitized (original) email keys so callers
     * can use real email addresses when checking availability.
     */
    public Map<String, List<LocalDate>> getAvailabilitiesUnsanitized() {
        Map<String, List<LocalDate>> out = new HashMap<>();
        for (Map.Entry<String, List<LocalDate>> e : availabilities.entrySet()) {
            out.put(unsanitizeKey(e.getKey()), e.getValue());
        }
        return out;
    }

    public void setAvailabilitiesUnsanitized(Map<String, List<LocalDate>> avail) {
        Map<String, List<LocalDate>> stored = new HashMap<>();
        if (avail != null) {
            for (Map.Entry<String, List<LocalDate>> e : avail.entrySet()) {
                stored.put(sanitizeKey(e.getKey()), e.getValue());
            }
        }
        this.availabilities = stored;
    }
}
