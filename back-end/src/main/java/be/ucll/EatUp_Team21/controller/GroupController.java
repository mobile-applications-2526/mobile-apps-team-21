package be.ucll.EatUp_Team21.controller;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.EatUp_Team21.controller.dto.GroupMemberResponse;
import be.ucll.EatUp_Team21.controller.dto.GroupRequest;
import be.ucll.EatUp_Team21.controller.dto.GroupResponse;
import be.ucll.EatUp_Team21.controller.dto.UserGroupRequest;
import be.ucll.EatUp_Team21.model.Message;
import be.ucll.EatUp_Team21.controller.dto.SuggestedRestaurantResponse;
import be.ucll.EatUp_Team21.service.GroupService;

import org.springframework.web.bind.annotation.DeleteMapping;
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

    @GetMapping("/getMembers/{groupId}")
    public List<String> getGroupMembers(@PathVariable String groupId, Authentication auth) {
        return groupService.getMembersByGroupId(groupId, auth.getName());
    }

    @GetMapping("/getMemberDetails/{groupId}")
    public List<GroupMemberResponse> getGroupMemberDetails(@PathVariable String groupId, Authentication auth) {
        return groupService.getMemberDetailsByGroupId(groupId, auth.getName());
    }

    @PutMapping("/restaurant")
    public String suggestRestaurant(@RequestParam String restId, @RequestParam String groupId, Authentication auth) {
        return groupService.suggestRestaurantToGroup(restId, groupId, auth.getName());
    }

    @GetMapping("/restaurant")
    public List<SuggestedRestaurantResponse> getSuggestedRestaurants(@RequestParam String groupId, Authentication auth) {
        var suggestions = groupService.getSuggestedRestaurants(groupId, auth.getName());
        return suggestions.stream().map(s -> new SuggestedRestaurantResponse(
            s.getId(), s.getRestaurant(), s.getRecommenderEmail(), s.getVoters(), s.getRecommendedAt()
        )).collect(Collectors.toList());
    }

    @PostMapping("/{groupId}/suggestions/{suggestionId}/vote")
    public String voteSuggestion(@PathVariable String groupId, @PathVariable String suggestionId, Authentication auth) {
        return groupService.voteSuggestion(groupId, suggestionId, auth.getName());
    }

    @PostMapping("/{groupId}/suggestions/{suggestionId}/unvote")
    public String unvoteSuggestion(@PathVariable String groupId, @PathVariable String suggestionId, Authentication auth) {
        return groupService.unvoteSuggestion(groupId, suggestionId, auth.getName());
    }

    @DeleteMapping("/{groupId}/suggestions/{suggestionId}")
    public String removeSuggestion(@PathVariable String groupId, @PathVariable String suggestionId, Authentication auth) {
        return groupService.removeSuggestion(groupId, suggestionId, auth.getName());
    }
    
    @PostMapping("/{groupId}/leave")
    public void leaveGroup(@PathVariable String groupId, Authentication auth) {
        // update last visited timestamp for this user in this group
        groupService.updateMemberLastVisitedByGroupId(groupId, auth.getName());
    }
    
}