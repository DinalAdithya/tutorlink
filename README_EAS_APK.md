# TutorLink - React Native / Expo & EAS APK Build Guide

This project is configured as a **React Native / Expo** mobile application with **EAS Build** support. You can build a standalone **Android APK (`.apk`)** in the Expo cloud **without installing Android Studio**!

---

## 🚀 How to Build the Android APK (Without Android Studio)

### Step 1: Install EAS CLI
In your local computer's terminal:
```bash
npm install -g eas-cli
```

### Step 2: Log in to Expo (Free Account)
```bash
eas login
```
*(If you don't have an Expo account, sign up for free at [expo.dev](https://expo.dev).)*

### Step 3: Run the Cloud Build for APK
In this project's root folder, run:
```bash
eas build -p android --profile preview
```

### Step 4: Download your APK!
- EAS will build the `.apk` in the Expo cloud.
- Once finished (takes ~3-5 minutes), EAS gives you a **direct download link and QR code**.
- Scan the QR code or download the `.apk` directly onto any Android device!

---

## 🔔 How Notifications & Pop-up Windows Work

1. **Student sends a session request**:
   - The booking is created.
   - Tutor receives an instant **system push notification** (Android heads-up alert with sound & vibration) via `expo-notifications`.
   - An in-app **Pop-up Window** (`NativeNotificationPopup`) appears immediately on screen with "Review Request", details, and dismiss options.

2. **Tutor accepts the request**:
   - Tutor accepts and attaches Google Meet or Zoom link.
   - Student receives an instant **system push notification** informing them their request was accepted.
   - An in-app **Pop-up Window** appears immediately on the student's screen displaying the accepted session and "View Session" / "Join Room" button.

---

## 📁 Key Expo Configuration Files Included

- **`app.json`**: Expo manifest configured with Android package name `com.tutorlink.app`, notification permissions (`POST_NOTIFICATIONS`, `VIBRATE`), and notification plugins.
- **`eas.json`**: EAS Build profiles configured with `buildType: "apk"` under the `preview` profile so it builds an installable APK instead of an AAB bundle.
- **`src/components/NativeNotificationPopup.tsx`**: Pure React Native Modal pop-up window for immediate notification alerts.
- **`src/services/nativeNotifications.ts`**: Native notification scheduler and handler for `expo-notifications`.
