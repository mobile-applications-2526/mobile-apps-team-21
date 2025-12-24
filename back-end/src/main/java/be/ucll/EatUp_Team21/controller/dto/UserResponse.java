package be.ucll.EatUp_Team21.controller.dto;

public record UserResponse(
    String name,
    String firstname,
    String phoneNumber,
    String email,
    int visitedRestaurantsCount,
    int favoriteRestaurantsCount
) {
} 
