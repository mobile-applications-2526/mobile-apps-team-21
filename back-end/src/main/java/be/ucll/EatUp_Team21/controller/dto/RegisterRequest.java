package be.ucll.EatUp_Team21.controller.dto;

public record RegisterRequest(
    String email,
    String password,
    String name,
    String firstName,
    String phoneNumber
) {    
}
