package be.ucll.EatUp_Team21.controller.dto;

public record ProfileStatsResponse(
    int totalVisitedRestaurants,
    int totalFavoriteRestaurants
) {
}
