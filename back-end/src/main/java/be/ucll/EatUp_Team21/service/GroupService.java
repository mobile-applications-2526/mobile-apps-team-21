package be.ucll.EatUp_Team21.service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import be.ucll.EatUp_Team21.controller.dto.GroupRequest;
import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.Message;
import be.ucll.EatUp_Team21.model.Restaurant;
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

    @Autowired
    private RestaurantService restaurantService;

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
        for(User u : group.getMembers()){
            if(u.getId().equals(newUser.getId())) return "User is already a member of this group.";
        }
        group.addMember(newUser);
        userService.addGroupToUser(newUser, group);
        groupRepository.save(group);
        return "User " + newUserEmail + " added to group " + group.getName();
    }

    public List<String> getMembersByGroupId(String groupId, String name) throws IllegalArgumentException {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new IllegalArgumentException("Group with id " + groupId + " does not exist"));
        if (!userService.isUserMemberOfGroup(name, groupId)) {
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

    public String suggestRestaurantToGroup(String restId, String groupId, String name) {
        if(!userService.userExists(name)) 
            throw new IllegalArgumentException("User does not exist");
        if(!restaurantService.restaurantexistsById(restId))
            throw new IllegalArgumentException("Restaurant with id " + restId + " does not exist.");
        if(!groupExistsById(groupId))
            throw new IllegalArgumentException("Group with id " + groupId + " does not exist.");
        Restaurant restaurant = restaurantService.getRestaurantById(restId);
        Group group = getGroupById(groupId);
        List<GroupResponse> userGroups = userService.getUserGroups(name);
        boolean pass = false;
        for(GroupResponse elem : userGroups){
            if (elem.id().equals(groupId)) pass = true;
        }
        if(!pass) 
            throw new IllegalArgumentException("User should be member of the group.");
        boolean resIn = false;
        for(Restaurant res : group.getSuggestedRestaurants()){
            if(res.getId().equals(restId)) resIn = true;
        }
        if(resIn) 
            return "Restaurant has already been suggested to this group.";
        group.addSuggestedRestaurant(restaurant);
        groupRepository.save(group);
        return "Restaurant succesfully suggested.";
    }

    private Group getGroupById(String groupId) {
        Optional<Group> gr = groupRepository.findById(groupId);
        if(gr.isPresent())
            return gr.get();
        throw new IllegalArgumentException("Group does not exist");
    }

    private boolean groupExistsById(String groupId) {
        return groupRepository.existsById(groupId);
    }
}
