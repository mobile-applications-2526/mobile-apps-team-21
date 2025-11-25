package be.ucll.EatUp_Team21.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.EatUp_Team21.model.Message;
import be.ucll.EatUp_Team21.service.GroupService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @GetMapping("/{name}/messages")
    public List<Message> getMessages(@PathVariable String name, Authentication auth) {
        return groupService.getMessagesForGroupAndUser(name, auth.getName());
    }
    
}