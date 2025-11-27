package be.ucll.EatUp_Team21.service;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import be.ucll.EatUp_Team21.controller.dto.GroupRequest;
import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
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
    private UserService userService;

    public List<Message> getMessagesForGroupAndUser(String name, String userEmail) {
        Group group = groupRepository.findByName(name);
        if (group != null) {
            User requestingUser = userService.getUserByEmail(userEmail);
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

    public GroupResponse createGroup(GroupRequest req, String email) {
        if (!userService.userExists(email)) {
            throw new IllegalArgumentException("User with email " + email + " does not exist");
        }
        User creator = userService.getUserByEmail(email);
        Group newGroup = new Group(req.name());
        newGroup.addMember(creator);
        Group group = groupRepository.save(newGroup);
        userService.addGroupToUser(creator, group);
        return new GroupResponse(group.getId(), group.getName(), 0);
    }

    public String addUserToGroup(String newUserEmail, String groupId, String adderEmail, String name) throws IllegalArgumentException {
        if (!userService.userExists(newUserEmail)) {
            throw new IllegalArgumentException("User with email " + newUserEmail + " does not exist");
        }
        if (!userService.userExists(adderEmail)) {
            throw new IllegalArgumentException("User with email " + adderEmail + " does not exist");
        }
        if (!userService.isUserMemberOfGroup(adderEmail, groupId.toString())) {
            throw new IllegalArgumentException("User with email " + adderEmail + " is not a member of the group");
        }
        if (!name.equals(adderEmail)) {
            throw new IllegalArgumentException("Authenticated user does not match adder email");
        }
        User newUser = userService.getUserByEmail(newUserEmail);
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new IllegalArgumentException("Group with id " + groupId + " does not exist"));
        group.addMember(newUser);
        userService.addGroupToUser(newUser, group);
        groupRepository.save(group);
        return "User " + newUserEmail + " added to group " + group.getName();
    }

    public List<String> getMembersByGroupId(String groupId, String name) throws IllegalArgumentException {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new IllegalArgumentException("Group with id " + groupId + " does not exist"));
        if (!userService.isUserMemberOfGroup(name, groupId.toString())) {
            throw new IllegalArgumentException("User with email " + name + " is not a member of the group");
        }
        return group.getMembers().stream().map(member -> member.getFirstName() + " " + member.getName()).toList();
    }

    public Group findByName(String name) {
        Group group = groupRepository.findByName(name);
        if (group == null) {
            throw new IllegalArgumentException("Group with name " + name + " does not exist");
        }
        return group;
    }

    public void updateMemberLastVisited(Group group, User user) {
        group.updateMemberLastVisited(user.getId(), LocalDateTime.now());
        groupRepository.save(group);
    }
}
