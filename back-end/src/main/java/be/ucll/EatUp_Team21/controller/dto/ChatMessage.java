package be.ucll.EatUp_Team21.controller.dto;

public record ChatMessage(
    String groupId,
    String senderEmail,
    String content
) {}
