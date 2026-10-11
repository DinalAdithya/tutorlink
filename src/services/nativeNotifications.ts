/**
 * Native Notifications Service
 * Integrates with Expo Notifications (for standalone Android APK built via EAS)
 * and falls back to Web Notification API and in-app event dispatch in dev preview.
 */
import { AppNotification } from '../types';

let expoNotifications: any = null;

// Dynamically check if expo-notifications is available in the runtime
try {
  // @ts-ignore
  expoNotifications = require('expo-notifications');
} catch {
  // Running in standard web or environments without expo-notifications
}

/**
 * Configure notification presentation behavior for Expo Native runtime
 */
export async function setupNativeNotifications(): Promise<void> {
  if (expoNotifications?.setNotificationHandler) {
    try {
      expoNotifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      const { status: existingStatus } = await expoNotifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await expoNotifications.requestPermissionsAsync();
        finalStatus = status;
      }
      console.log('Expo Push Notifications permission status:', finalStatus);
    } catch (err) {
      console.warn('Expo Notifications setup warning:', err);
    }
  }
}

/**
 * Trigger an immediate notification on the device
 * In Expo Android APK: Displays system heads-up notification with sound
 * In Web/Preview: Dispatches custom event for the Pop-up Window modal
 */
export async function triggerDeviceNotification(notification: AppNotification): Promise<void> {
  // 1. Always emit local in-app event for instant pop-up window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tutorlink_notification_created', { detail: notification })
    );
  }

  // 2. If running on native Expo (Android APK / EAS Build)
  if (expoNotifications?.scheduleNotificationAsync) {
    try {
      await expoNotifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: {
            bookingId: notification.bookingId,
            type: notification.type,
            recipientRole: notification.recipientRole,
          },
          sound: true,
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // deliver immediately
      });
    } catch (err) {
      console.warn('Failed to schedule expo notification:', err);
    }
  }
}
