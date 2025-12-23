# Push Notification Implementation Guide

## Backend-Triggered Push Notifications for Voting Threshold

This implementation sends push notifications to **all group members** when more than 50% of the group votes for a restaurant.

---

## Implementation Steps

### 1. **Frontend Setup** (Already Done ✅)

#### Install packages:
```bash
cd front-end-expo
npx expo install expo-notifications expo-device expo-constants
```

#### Register for push notifications on app start:
Add to your `AuthContext.tsx` or main app file:

```typescript
import { registerForPushNotificationsAsync, sendPushTokenToBackend } from '@/services/pushNotificationService';
import { useEffect } from 'react';

// Inside your component or Auth context:
useEffect(() => {
  if (userEmail && token) {
    registerForPushNotificationsAsync().then(pushToken => {
      if (pushToken) {
        sendPushTokenToBackend(pushToken, token);
      }
    });
  }
}, [userEmail, token]);
```

---

### 2. **Backend Setup**

#### A. Add RestTemplate Bean (if not exists)
Create `Config/RestTemplateConfig.java`:

```java
package be.ucll.EatUp_Team21.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

#### B. Create endpoint to receive push tokens
Add to your `UserController.java`:

```java
@PostMapping("/push-token")
public ResponseEntity<?> updatePushToken(
    @RequestBody Map<String, String> body,
    @RequestHeader("Authorization") String authHeader
) {
    String pushToken = body.get("pushToken");
    String email = extractEmailFromToken(authHeader); // Your JWT extraction logic
    
    notificationService.updateUserPushToken(email, pushToken);
    
    return ResponseEntity.ok().body(Map.of("message", "Push token updated"));
}
```

#### C. Integrate with your voting service
In your voting method (e.g., `voteSuggestion`), add this logic:

```java
// After successfully recording the vote:
SuggestedRestaurant suggestion = // ... get updated suggestion
Group group = // ... get group
List<String> memberEmails = group.getMembers().stream()
    .map(User::getEmail)
    .collect(Collectors.toList());

// Check if threshold is reached
if (notificationService.checkVotingThreshold(
    suggestion.getVoters().size(), 
    memberEmails.size()
)) {
    // Send push notification to all group members
    notificationService.notifyGroupMembersAboutThreshold(
        group.getId(),
        suggestion.getRestaurant().getName(),
        memberEmails,
        suggestion.getVoters().size(),
        memberEmails.size()
    );
}
```

---

### 3. **Update Frontend Service**

In `services/pushNotificationService.ts`, replace `YOUR_BACKEND_URL`:

```typescript
const response = await fetch('http://YOUR_BACKEND_URL/api/users/push-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(userToken && { 'Authorization': `Bearer ${userToken}` }),
  },
  body: JSON.stringify({ pushToken: token }),
});
```

---

### 4. **Handle Incoming Notifications (Frontend)**

Add to your root component or `_layout.tsx`:

```typescript
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

// Inside component:
const notificationListener = useRef<any>();
const responseListener = useRef<any>();

useEffect(() => {
  // Listen for notifications while app is in foreground
  notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });

  // Handle notification tap
  responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    // Navigate to group chat or restaurant details
    if (data.groupId && data.type === 'voting_threshold_reached') {
      // Navigate to your group chat screen
      // router.push(`/chatsPage/chat?groupId=${data.groupId}`);
    }
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener.current);
    Notifications.removeNotificationSubscription(responseListener.current);
  };
}, []);
```

---

## Testing

### Test push notifications:
1. **Get your Expo Push Token**: 
   - Run the app, check console logs after login
   - Copy the token (starts with `ExponentPushToken[...]`)

2. **Send test notification** using Expo's tool:
   - Go to https://expo.dev/notifications
   - Paste your token
   - Send a test notification

3. **Test from backend**:
   - Vote on a restaurant until threshold is reached
   - All group members should receive notifications

---

## Important Notes

- **Physical device required** for push notifications (doesn't work on emulator)
- **Expo Go limitation**: Push notifications work, but for production, use EAS Build
- **Token expiry**: Push tokens can expire, re-register on each app start
- **Background notifications**: Work automatically on both iOS and Android
- **Production**: For Firebase Cloud Messaging, you'll need to configure EAS Build with FCM credentials

---

## Flow Summary

1. User logs in → Frontend registers for push notifications
2. Frontend sends push token to backend → Backend saves to User model
3. User votes on restaurant → Backend checks if threshold reached
4. If threshold reached → Backend sends push notification to ALL group members via Expo Push Service
5. Group members receive notification (even if app is closed)
6. Tapping notification opens app to group chat

---

## Files Created

**Frontend:**
- `services/pushNotificationService.ts` - Push token registration
- `components/PushNotification.tsx` - UI notification component (already done)

**Backend:**
- `controller/PushNotificationController.java` - Send push notifications
- `service/NotificationService.java` - Business logic for notifications
- `model/User.java` - Added `expoPushToken` field

---

## Next Steps

1. Update `YOUR_BACKEND_URL` in `pushNotificationService.ts`
2. Add push token endpoint to your UserController
3. Integrate notification logic into your voting service
4. Add RestTemplate bean if not exists
5. Test with physical device
