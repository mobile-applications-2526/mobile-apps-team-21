package be.ucll.EatUp_Team21.controller.dto;

import java.time.LocalDateTime;

public record MessageResponse(
    String id,
    String content,
    LocalDateTime timestamp,
    String authorId,
    String groupId
) {}
