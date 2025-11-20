package be.ucll.EatUp_Team21.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
import be.ucll.EatUp_Team21.controller.dto.UserRequest;
import be.ucll.EatUp_Team21.service.UserService;
import io.swagger.v3.oas.annotations.parameters.RequestBody;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/groups")
    public List<GroupResponse> getUserGroups(@RequestBody UserRequest userReq ,Authentication param) {
        if (userReq.email() != null && param.getName().equals(userReq.email()) == true) {
            return userService.getUserGroups(userReq.email());
        } 
        throw new IllegalArgumentException("Email in request does not match authenticated user");
    }
}
