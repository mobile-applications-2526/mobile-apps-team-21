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
     * Check if voting threshold is reached (more than 1/2 of members voted)
     * Return true if threshold is reached
     */
    public boolean checkVotingThreshold(int voterCount, int totalMembers) {
        return voterCount > (totalMembers / 2.0);
    }
}
