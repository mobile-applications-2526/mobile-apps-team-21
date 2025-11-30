package be.ucll.EatUp_Team21.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import be.ucll.EatUp_Team21.controller.dto.MessageRequest;
import be.ucll.EatUp_Team21.model.*;
import be.ucll.EatUp_Team21.repository.MessageRepository;

@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    public Message writeMessage(String groupName, MessageRequest mesReq, Authentication auth) {
        // method accepts Authentication for compatibility; not required by current implementation
        if (auth == null) {
            // no-op, parameter intentionally unused
        }
        Group group = groupService.getGroupByName(groupName);
        if (group == null) {
            throw new IllegalArgumentException("Group with name " + groupName + " does not exist");
        } 
        if (!group.getId().equals(mesReq.groupId())) {
            throw new IllegalArgumentException("Group ID in message request does not match group name");
        }
        if (!userService.isUserMemberOfGroup(mesReq.senderEmail(), group.getId())) {
            throw new IllegalArgumentException("User with email " + mesReq.senderEmail() + " is not a member of group " + groupName);
        }
        // Save the message to the database
        User user = userService.getUserByEmail(mesReq.senderEmail());
        Message message = new Message(
            mesReq.content(),
            user,
            group
        );
        messageRepository.save(message);
        return message;
    }
}
