package be.ucll.EatUp_Team21.controller.dto;

import java.time.LocalDateTime;

public record RestaurantRelationResponse(
    String id,
    String restaurantId,
    String restaurantName,
    String restaurantAddress,
    String restaurantDescription,
    String restaurantPhoneNumber,
    Float rating,
    boolean isFavorite,
    boolean hasVisited,
    LocalDateTime visitedDate
) {
}
