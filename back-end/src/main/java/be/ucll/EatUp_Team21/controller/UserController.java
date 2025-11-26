package be.ucll.EatUp_Team21.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.method.P;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
import be.ucll.EatUp_Team21.controller.dto.RegisterRequest;
import be.ucll.EatUp_Team21.controller.dto.RegisterResponse;
import be.ucll.EatUp_Team21.controller.dto.UserRequest;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.service.UserService;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/groups")
    public List<GroupResponse> getUserGroups(@RequestParam String email, Authentication param) {
        if (email != null && param.getName().equals(email)) {
            return userService.getUserGroups(email);
        }
        throw new IllegalArgumentException("Email in request does not match authenticated user");
    }

    @PostMapping("/register")
    public RegisterResponse registerUser(@RequestBody RegisterRequest req) {
        return userService.registerUser(req);
    }
}
