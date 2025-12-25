package be.ucll.EatUp_Team21.controller.dto;

public record UpdateGroupVisitRequest(
    Double totalPrice,
    String paidByEmail,
    String paidByName,
    String receiptImage
) {
}
