package be.ucll.EatUp_Team21.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import be.ucll.EatUp_Team21.controller.dto.GroupRequest;
import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
import be.ucll.EatUp_Team21.controller.dto.SuggestedRestaurantResponse;
import be.ucll.EatUp_Team21.model.Group;
import be.ucll.EatUp_Team21.model.Message;
import be.ucll.EatUp_Team21.model.Restaurant;
import be.ucll.EatUp_Team21.model.SuggestedRestaurant;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.repository.GroupRepository;
import be.ucll.EatUp_Team21.repository.MessageRepository;
import be.ucll.EatUp_Team21.repository.SuggestedRestaurantRepository;
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

    @Autowired
    private SuggestedRestaurantRepository suggestedRestaurantRepository;

    @Autowired
    private NotificationService notificationService;

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

    public String addUserToGroup(String newUserEmail, String groupId, String adderEmail, String name)
            throws IllegalArgumentException {
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
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group with id " + groupId + " does not exist"));
        for (User u : group.getMembers()) {
            if (u.getId().equals(newUser.getId()))
                return "User is already a member of this group.";
        }
        group.addMember(newUser);
        userService.addGroupToUser(newUser, group);
        groupRepository.save(group);
        return "User " + newUserEmail + " added to group " + group.getName();
    }

    public List<String> getMembersByGroupId(String groupId, String name) throws IllegalArgumentException {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group with id " + groupId + " does not exist"));
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

    /**
     * Update last-visited for a given group id and username (email).
     * Exposed for controllers to update when a user explicitly "leaves" a group.
     */
    public void updateMemberLastVisitedByGroupId(String groupId, String userEmail) {
        Group group = getGroupById(groupId);
        User user = userService.getUserByEmail(userEmail);
        if (user == null)
            throw new IllegalArgumentException("User does not exist");
        updateMemberLastVisited(group, user);
    }

    public String suggestRestaurantToGroup(String restId, String groupId, String name) {
        if (!userService.userExists(name))
            throw new IllegalArgumentException("User does not exist");
        if (!restaurantService.restaurantexistsById(restId))
            throw new IllegalArgumentException("Restaurant with id " + restId + " does not exist.");
        if (!groupExistsById(groupId))
            throw new IllegalArgumentException("Group with id " + groupId + " does not exist.");
        Restaurant restaurant = restaurantService.getRestaurantById(restId);
        Group group = getGroupById(groupId);
        List<GroupResponse> userGroups = userService.getUserGroups(name);
        boolean pass = false;
        for (GroupResponse elem : userGroups) {
            if (elem.id().equals(groupId))
                pass = true;
        }
        if (!pass)
            throw new IllegalArgumentException("User should be member of the group.");
        boolean resIn = false;
        for (SuggestedRestaurant s : group.getSuggestedRestaurants()) {
            if (s.getRestaurant() != null && s.getRestaurant().getId().equals(restId)) {
                resIn = true;
                break;
            }
        }
        if (resIn)
            return "Restaurant has already been suggested to this group.";
        SuggestedRestaurant s = new SuggestedRestaurant(restaurant, name);
        suggestedRestaurantRepository.save(s);
        group.addSuggestedRestaurant(s);
        groupRepository.save(group);
        return "Restaurant succesfully suggested.";
    }

    private Group getGroupById(String groupId) {
        Optional<Group> gr = groupRepository.findById(groupId);
        if (gr.isPresent())
            return gr.get();
        throw new IllegalArgumentException("Group does not exist");
    }

    private boolean groupExistsById(String groupId) {
        return groupRepository.existsById(groupId);
    }

    public List<SuggestedRestaurant> getSuggestedRestaurants(String groupId, String name) {
        if (!userService.userExists(name))
            throw new IllegalArgumentException("User does not exist");
        if (!userInGroup(groupId, name))
            throw new IllegalArgumentException("User is not a member of this group.");
        Group group = getGroupById(groupId);
        return group.getSuggestedRestaurants();
    }

    public String voteSuggestion(String groupId, String suggestionId, String userEmail) {
        if (!userService.userExists(userEmail))
            throw new IllegalArgumentException("User does not exist");
        if (!userInGroup(groupId, userEmail))
            throw new IllegalArgumentException("User is not a member of this group.");
        Group group = getGroupById(groupId);
        boolean found = false;
        for (SuggestedRestaurant s : group.getSuggestedRestaurants()) {
            if (s.getId() != null && s.getId().equals(suggestionId)) {
                s.addVoter(userEmail);
                found = true;
                suggestedRestaurantRepository.save(s);
                break;
            }
        }
        if (!found)
            throw new IllegalArgumentException("Suggestion not found");
        groupRepository.save(group);
        SuggestedRestaurant s = group.getSuggestedRestaurants().stream().filter(sug -> sug.getId().equals(suggestionId))
                .findFirst().orElse(null);
        sendThreshholdNotification(group, s);
        return "Vote Succesfull";
    }

    private void sendThreshholdNotification(Group group, SuggestedRestaurant suggestion) {
        List<String> memberEmails = group.getMembers().stream()
                .map(User::getEmail)
                .collect(Collectors.toList());

        // Do nothing if suggestion is null
        if (suggestion == null) return;

        // Check if threshold is reached
        if (notificationService.checkVotingThreshold(
                suggestion.getVoters().size(),
                memberEmails.size())) {
            // Send push notification to all group members
            notificationService.notifyGroupMembersAboutThreshold(
                    group.getId(),
                    suggestion.getRestaurant().getName(),
                    memberEmails,
                    suggestion.getVoters().size(),
                    memberEmails.size());
            // mark suggestion as closed so we don't spam further notifications
            suggestion.setClosed(true);
            suggestedRestaurantRepository.save(suggestion);
        }
    }

    /**
     * Set availability (dates) for the authenticated user for a specific suggestion.
     * Expects date strings in ISO format (yyyy-MM-dd).
     */
    public String setAvailability(String groupId, String suggestionId, String userEmail, List<String> dateStrings) {
        if (!userService.userExists(userEmail))
            throw new IllegalArgumentException("User does not exist");
        if (!userInGroup(groupId, userEmail))
            throw new IllegalArgumentException("User is not a member of this group.");

        Group group = getGroupById(groupId);
        SuggestedRestaurant target = null;
        for (SuggestedRestaurant s : group.getSuggestedRestaurants()) {
            if (s.getId() != null && s.getId().equals(suggestionId)) {
                target = s;
                break;
            }
        }
        if (target == null) throw new IllegalArgumentException("Suggestion not found");

        // Only allow availability once suggestion is closed (threshold reached)
        if (!target.isClosed()) {
            throw new IllegalArgumentException("Suggestion has not been closed for scheduling yet");
        }

        // any group member may provide availability (voters are required for locking)

        // parse date strings to LocalDate
        List<java.time.LocalDate> dates = new ArrayList<>();
        if (dateStrings != null) {
            for (String ds : dateStrings) {
                if (ds == null) continue;
                try {
                    dates.add(java.time.LocalDate.parse(ds));
                } catch (Exception e) {
                    throw new IllegalArgumentException("Invalid date format: " + ds);
                }
            }
        }

        target.setAvailabilityForUser(userEmail, dates);
        suggestedRestaurantRepository.save(target);

        // check if all voters provided availability
        boolean allProvided = true;
        for (String voter : target.getVoters()) {
            if (!target.getAvailabilitiesUnsanitized().containsKey(voter) || target.getAvailabilitiesUnsanitized().get(voter).isEmpty()) {
                allProvided = false;
                break;
            }
        }

        if (allProvided && target.getLockedDate() == null) {
            // compute intersection of all voters' dates
            List<java.time.LocalDate> intersection = null;
            for (String voter : target.getVoters()) {
                List<java.time.LocalDate> userDates = target.getAvailabilitiesUnsanitized().getOrDefault(voter, new ArrayList<>());
                if (intersection == null) {
                    intersection = new ArrayList<>(userDates);
                } else {
                    intersection.removeIf(d -> !userDates.contains(d));
                }
            }

            java.time.LocalDate locked = null;
            if (intersection != null && !intersection.isEmpty()) {
                locked = intersection.stream().min(java.time.LocalDate::compareTo).orElse(null);
            } else {
                // pick most popular date across all lists
                java.util.Map<java.time.LocalDate, Integer> counts = new java.util.HashMap<>();
                for (String voter : target.getVoters()) {
                    for (java.time.LocalDate d : target.getAvailabilitiesUnsanitized().getOrDefault(voter, new ArrayList<>())) {
                        counts.put(d, counts.getOrDefault(d, 0) + 1);
                    }
                }
                int max = 0;
                for (java.util.Map.Entry<java.time.LocalDate, Integer> e : counts.entrySet()) {
                    if (e.getValue() > max) max = e.getValue();
                }
                java.time.LocalDate best = null;
                for (java.util.Map.Entry<java.time.LocalDate, Integer> e : counts.entrySet()) {
                    if (e.getValue() == max) {
                        if (best == null || e.getKey().isBefore(best)) best = e.getKey();
                    }
                }
                locked = best;
            }

                target.setLockedDate(locked);
                suggestedRestaurantRepository.save(target);

                // notify recommender and all group members that a date has been locked
                notificationService.notifyUserAboutLockedDate(target.getRecommenderEmail(), group.getId(), target.getId(), target.getRestaurant().getName(), locked);
                List<String> memberEmails = group.getMembers().stream()
                    .map(u -> u.getEmail())
                    .collect(Collectors.toList());
                notificationService.notifyMembersAboutLockedDate(memberEmails, group.getId(), target.getId(), target.getRestaurant().getName(), locked);
        }

        groupRepository.save(group);
        return "Availability saved";
    }

    public String unvoteSuggestion(String groupId, String suggestionId, String userEmail) {
        if (!userService.userExists(userEmail))
            throw new IllegalArgumentException("User does not exist");
        if (!userInGroup(groupId, userEmail))
            throw new IllegalArgumentException("User is not a member of this group.");
        Group group = getGroupById(groupId);
        boolean found = false;
        for (SuggestedRestaurant s : group.getSuggestedRestaurants()) {
            if (s.getId() != null && s.getId().equals(suggestionId)) {
                s.removeVoter(userEmail);
                found = true;
                suggestedRestaurantRepository.save(s);
                break;
            }
        }
        if (!found)
            throw new IllegalArgumentException("Suggestion not found");
        groupRepository.save(group);
        return "Vote removed";
    }

    public String removeSuggestion(String groupId, String suggestionId, String userEmail) {
        Group group = getGroupById(groupId);
        SuggestedRestaurant toRemove = null;
        for (SuggestedRestaurant s : group.getSuggestedRestaurants()) {
            if (s.getId() != null && s.getId().equals(suggestionId)) {
                toRemove = s;
                break;
            }
        }
        if (toRemove == null)
            throw new IllegalArgumentException("Suggestion not found");
        // only recommender may remove
        if (!userEmail.equals(toRemove.getRecommenderEmail())) {
            throw new IllegalArgumentException("Only the recommender can unrecommend this restaurant");
        }
        group.getSuggestedRestaurants().remove(toRemove);
        suggestedRestaurantRepository.deleteById(toRemove.getId());
        groupRepository.save(group);
        return "Suggestion succesfully removed";
    }

    private boolean userInGroup(String groupId, String name) {
        Group group = getGroupById(groupId);
        for (User u : group.getMembers()) {
            if (u.getEmail().equals(name))
                return true;
        }
        return false;
    }
}
