package be.ucll.EatUp_Team21.controller.dto;

import java.time.LocalDate;

public record GroupVisitResponse(
    String id,
    String restaurantId,
    String restaurantName,
    String restaurantAddress,
    String groupId,
    String groupName,
    LocalDate visitDate,
    Double totalPrice,
    String paidByEmail,
    String paidByName,
    String cuisine,
    boolean hasReceipt,
    Float userRating
) {
}
