package be.ucll.EatUp_Team21.controller;

import java.util.List;
import be.ucll.EatUp_Team21.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.EatUp_Team21.controller.dto.GroupRequest;
import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
import be.ucll.EatUp_Team21.controller.dto.UserGroupRequest;
import be.ucll.EatUp_Team21.controller.dto.UserRequest;
import be.ucll.EatUp_Team21.model.Message;
import be.ucll.EatUp_Team21.service.GroupService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @GetMapping("/{name}/messages")
    public List<Message> getMessages(@PathVariable String name, Authentication auth) {
        return groupService.getMessagesForGroupAndUser(name, auth.getName());
    }

    @PostMapping("/create")
    public GroupResponse createGroup(@RequestBody GroupRequest req, Authentication auth) {
        return groupService.createGroup(req, auth.getName());
    }

    @PutMapping("/addUser")
    public String addUserToGroup(@RequestBody UserGroupRequest entity, Authentication auth) {
        return groupService.addUserToGroup(entity.newUserEmail(), entity.groupId(), entity.adderEmail(), auth.getName());
    }
}