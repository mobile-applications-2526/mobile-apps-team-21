package be.ucll.EatUp_Team21.service;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.repository.UserRepository;
import be.ucll.EatUp_Team21.repository.MessageRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    public List<GroupResponse> getUserGroups(String email) {
        User user = userRepository.findUserByEmail(email);
        return user.getGroups().stream()
                .map(group -> {
                    // determine last visited time for this user for the group
                    LocalDateTime lastVisited = null;
                    if (group.getMemberLastVisited() != null) {
                        lastVisited = group.getMemberLastVisited().get(user.getId());
                    }
                    if (lastVisited == null) {
                        // if never visited, set a safe epoch fallback (avoid LocalDateTime.MIN which isn't supported by java.util.Date)
                        lastVisited = LocalDateTime.of(1970, 1, 1, 0, 0);
                    }
                    long missed = messageRepository.countByGroup_IdAndTimestampAfter(group.getId(), lastVisited);
                    return new GroupResponse(group.getId(), group.getName(), (int) missed);
                })
                .toList();
    }

	public boolean isUserMemberOfGroup(String senderEmail, String id) {
        User user = userRepository.findUserByEmail(senderEmail);
        if (user != null && user.getGroups() != null) {
            return user.getGroups().stream()
                    .anyMatch(group -> group.getId() != null && group.getId().equals(id));
        }
        return false;
	}

    public User getUserByEmail(String senderEmail) {
        return userRepository.findUserByEmail(senderEmail);
    }


}
