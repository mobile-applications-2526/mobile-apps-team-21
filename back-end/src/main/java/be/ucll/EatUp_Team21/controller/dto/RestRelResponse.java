package be.ucll.EatUp_Team21.controller.dto;

import java.time.LocalDate;

public record RestRelResponse(
    String restaurantName,
    String restaurantAddress,
    LocalDate visitDate,
    boolean isFavorite
) {
}
