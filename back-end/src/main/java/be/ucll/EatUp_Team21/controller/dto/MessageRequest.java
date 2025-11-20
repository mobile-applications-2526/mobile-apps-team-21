package be.ucll.EatUp_Team21.controller.dto;

public record MessageRequest(
    String content,
    String senderEmail,
    String groupId
) {
}
