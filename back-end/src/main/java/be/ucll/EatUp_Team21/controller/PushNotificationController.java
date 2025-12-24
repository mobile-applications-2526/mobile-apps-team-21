package be.ucll.EatUp_Team21.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
public class PushNotificationController {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Send push notification via Expo Push Notification Service
     * Call this method when voting threshold is reached
     */
    public void sendPushNotification(List<String> expoPushTokens, String title, String body, Map<String, Object> data) {
        List<Map<String, Object>> messages = new ArrayList<>();

        for (String token : expoPushTokens) {
            Map<String, Object> message = new HashMap<>();
            message.put("to", token);
            message.put("sound", "default");
            message.put("title", title);
            message.put("body", body);
            message.put("data", data != null ? data : new HashMap<>());
            message.put("priority", "high");
            
            messages.add(message);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            headers.set("Accept-Encoding", "gzip, deflate");

            HttpEntity<List<Map<String, Object>>> request = new HttpEntity<>(messages, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(EXPO_PUSH_URL, request, String.class);
            
            System.out.println("Push notification sent successfully: " + response.getBody());
        } catch (Exception e) {
            System.err.println("Failed to send push notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Example: Send notification when voting threshold is reached
     * This should be called from your voting service
     */
    public void notifyGroupAboutVotingThreshold(
        String groupId, 
        String restaurantName, 
        List<String> memberPushTokens,
        int voterCount,
        int totalMembers
    ) {
        String title = "🎉 Consensus Reached!";
        String body = String.format(
            "More than half the group (%d/%d) wants to go to %s!", 
            voterCount, 
            totalMembers, 
            restaurantName
        );

        Map<String, Object> data = new HashMap<>();
        data.put("type", "voting_threshold_reached");
        data.put("groupId", groupId);
        data.put("restaurantName", restaurantName);
        data.put("voterCount", voterCount);
        data.put("totalMembers", totalMembers);

        sendPushNotification(memberPushTokens, title, body, data);
    }
}
