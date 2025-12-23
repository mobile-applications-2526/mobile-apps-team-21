package be.ucll.EatUp_Team21.controller.dto;

import java.time.LocalDateTime;
import java.util.List;

import be.ucll.EatUp_Team21.model.Restaurant;

public record SuggestedRestaurantResponse(
    String id,
    Restaurant restaurant,
    String recommenderEmail,
    List<String> voters,
    LocalDateTime recommendedAt
) {
}
