package be.ucll.EatUp_Team21.service;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.Message;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.repository.GroupRepository;
import be.ucll.EatUp_Team21.repository.MessageRepository;
import be.ucll.EatUp_Team21.repository.UserRepository;


@Service
public class GroupService {
    
    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Message> getMessagesForGroupAndUser(String name, String userEmail) {
        Group group = groupRepository.findByName(name);
        if (group != null) {
            User requestingUser = userRepository.findUserByEmail(userEmail);
            if (requestingUser != null && group.getMembers() != null && group.getMembers().stream()
                    .anyMatch(member -> (member.getId() != null && member.getId().equals(requestingUser.getId()))
                            || (member.getEmail() != null && member.getEmail().equals(userEmail)))) {
                // update last visited timestamp for this user (use user id as key)
                group.updateMemberLastVisited(requestingUser.getId(), LocalDateTime.now());
                groupRepository.save(group);

                return messageRepository.findByGroupId(group.getId());
            }
        }

        throw new RuntimeException("User not authorized to access messages for this group");
    }

    public Group getGroupByName(String groupName) {
        return groupRepository.findByName(groupName);
    }
}
