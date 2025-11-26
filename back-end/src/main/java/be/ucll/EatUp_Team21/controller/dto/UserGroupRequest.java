package be.ucll.EatUp_Team21.controller.dto;

public record UserGroupRequest(
    String newUserEmail, 
    String adderEmail,
    String groupId
) {
}
