package be.ucll.EatUp_Team21.service;

import be.ucll.EatUp_Team21.controller.PushNotificationController;
import be.ucll.EatUp_Team21.model.User;
import be.ucll.EatUp_Team21.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private PushNotificationController pushNotificationController;

    @Autowired
    private UserRepository userRepository;

    /**
     * Update user's Expo push token
     * This should be called when user logs in or token changes
     */
    public void updateUserPushToken(String email, String expoPushToken) {
        User user = userRepository.findUserByEmail(email);
        if (user != null) {
            user.setExpoPushToken(expoPushToken);
            userRepository.save(user);
        }
    }

    /**
     * Send push notification to all group members when voting threshold is reached
     * Call this method after a vote is cast and check if threshold is met
     */
    public void notifyGroupMembersAboutThreshold(
        String groupId,
        String restaurantName,
        List<String> memberEmails,
        int voterCount,
        int totalMembers
    ) {
        // Get all push tokens for group members
        List<String> pushTokens = memberEmails.stream()
            .map(email -> userRepository.findUserByEmail(email))
            .filter(user -> user != null && user.getExpoPushToken() != null)
            .map(User::getExpoPushToken)
            .collect(Collectors.toList());

        if (!pushTokens.isEmpty()) {
            pushNotificationController.notifyGroupAboutVotingThreshold(
                groupId,
                restaurantName,
                pushTokens,
                voterCount,
                totalMembers
            );
        }
    }

    /**
     * Notify a single user (by email) that a visit date has been locked for a suggestion
     */
    public void notifyUserAboutLockedDate(String email, String groupId, String suggestionId, String restaurantName, java.time.LocalDate lockedDate) {
        User user = userRepository.findUserByEmail(email);
        if (user == null || user.getExpoPushToken() == null) return;

        java.util.List<String> tokens = java.util.List.of(user.getExpoPushToken());

        String title = "📅 Visit Date Locked";
        String body = String.format("A visit date for %s is locked: %s", restaurantName, lockedDate != null ? lockedDate.toString() : "(none)");

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("type", "visit_date_locked");
        data.put("groupId", groupId);
        data.put("suggestionId", suggestionId);
        data.put("restaurantName", restaurantName);
        data.put("lockedDate", lockedDate != null ? lockedDate.toString() : null);

        pushNotificationController.sendPushNotification(tokens, title, body, data);
    }

    /**
     * Notify a set of users (by email) that a visit date has been locked for a suggestion
     */
    public void notifyMembersAboutLockedDate(List<String> memberEmails, String groupId, String suggestionId, String restaurantName, java.time.LocalDate lockedDate) {
        // Get push tokens for these members
        List<String> pushTokens = memberEmails.stream()
            .map(email -> userRepository.findUserByEmail(email))
            .filter(user -> user != null && user.getExpoPushToken() != null)
            .map(User::getExpoPushToken)
            .collect(Collectors.toList());

        if (pushTokens.isEmpty()) return;

        String title = "📅 Visit Date Locked";
        String body = String.format("A visit date for %s is locked: %s", restaurantName, lockedDate != null ? lockedDate.toString() : "(none)");

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("type", "visit_date_locked");
        data.put("groupId", groupId);
        data.put("suggestionId", suggestionId);
        data.put("restaurantName", restaurantName);
        data.put("lockedDate", lockedDate != null ? lockedDate.toString() : null);

        pushNotificationController.sendPushNotification(pushTokens, title, body, data);
    }

    /**
     * Check if voting threshold is reached (more than 1/2 of members voted)
     * Return true if threshold is reached
     */
    public boolean checkVotingThreshold(int voterCount, int totalMembers) {
        return voterCount > (totalMembers / 2.0);
    }

    /**
     * Notify a single user that no common date could be found for the suggestion
     */
    public void notifyUserNoCommonDate(String email, String groupId, String suggestionId, String restaurantName) {
        User user = userRepository.findUserByEmail(email);
        if (user == null || user.getExpoPushToken() == null) return;

        java.util.List<String> tokens = java.util.List.of(user.getExpoPushToken());

        String title = "📅 No Common Date Found";
        String body = String.format("We couldn't find a date that works for all voters for %s.", restaurantName);

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("type", "visit_date_not_found");
        data.put("groupId", groupId);
        data.put("suggestionId", suggestionId);
        data.put("restaurantName", restaurantName);

        pushNotificationController.sendPushNotification(tokens, title, body, data);
    }

    /**
     * Notify a set of members that no common date could be found for the suggestion
     */
    public void notifyMembersNoCommonDate(List<String> memberEmails, String groupId, String suggestionId, String restaurantName) {
        List<String> pushTokens = memberEmails.stream()
            .map(email -> userRepository.findUserByEmail(email))
            .filter(user -> user != null && user.getExpoPushToken() != null)
            .map(User::getExpoPushToken)
            .collect(Collectors.toList());

        if (pushTokens.isEmpty()) return;

        String title = "📅 No Common Date Found";
        String body = String.format("We couldn't find a date that works for all voters for %s.", restaurantName);

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("type", "visit_date_not_found");
        data.put("groupId", groupId);
        data.put("suggestionId", suggestionId);
        data.put("restaurantName", restaurantName);

        pushNotificationController.sendPushNotification(pushTokens, title, body, data);
    }
}
