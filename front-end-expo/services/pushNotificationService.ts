import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { buildApiUrl } from '@/utils/apiConfig';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register device for push notifications and get Expo Push Token
 * This token should be sent to your backend
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId ?? 'your-project-id',
    })).data;
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Send the push token to your backend
 * Call this after user logs in
 */
export async function sendPushTokenToBackend(token: string, userToken?: string) {
  try {
    // Backend user controller exposes /users/push-token (no /api prefix)
    const url = buildApiUrl('/users/push-token');
    console.log('Sending push token to backend:', url, token);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userToken && { 'Authorization': `Bearer ${userToken}` }),
      },
      body: JSON.stringify({ pushToken: token }),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error('Push token backend responded with error', response.status, text);
      throw new Error(`Failed to send push token to backend: ${response.status}`);
    }
    console.log('Push token accepted by backend:', response.status, text);
    return { ok: true, status: response.status, body: text };
  } catch (error) {
    console.error('Error sending push token to backend:', error);
    return { ok: false, error: String(error) };
  }
}
