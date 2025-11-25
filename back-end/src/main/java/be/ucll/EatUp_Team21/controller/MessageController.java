package be.ucll.EatUp_Team21.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.EatUp_Team21.controller.dto.MessageRequest;
import be.ucll.EatUp_Team21.service.MessageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;
    
    @PostMapping("/{groupName}")
    public String writeMessage(@RequestParam String groupName, @RequestBody MessageRequest mesReq, Authentication auth) {        
        if (groupName == null || groupName.isEmpty()) {
            throw new IllegalArgumentException("Group name must be provided");
        } else if (mesReq == null) {
            throw new IllegalArgumentException("Message request body must be provided");
        } else if (auth == null || auth.getName() == null || auth.getName().isEmpty()) {
            throw new IllegalArgumentException("Authenticated user information is missing");
        } else if (!auth.getName().equals(mesReq.senderEmail())) {
            throw new IllegalArgumentException("Authenticated user does not match message sender");
        } else if (auth.getName().equals(mesReq.senderEmail()))
            return messageService.writeMessage(groupName, mesReq);
        throw new IllegalArgumentException("Unknown error occurred while processing the message");
    }
}
