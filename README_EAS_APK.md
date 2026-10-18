# TutorLink - React Native / Expo & EAS APK Build Guide

This project is configured as a **React Native / Expo** mobile application with **EAS Build** support. The Android app uses native React Native screens (`src/App.native.tsx`); the browser app remains in `src/App.tsx`. Local demo data is persisted on-device with Expo SQLite.

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

Session requests and responses are stored in the app’s local notification inbox, available from the **Alerts** tab. System push notifications and popup windows are not currently enabled in the native app.

## 📱 Run on Android with Expo Go

This project uses Expo SDK 57. Install the Android Expo Go version for SDK 57 from [expo.dev/go](https://expo.dev/go) if the Play Store version is not compatible. Then, from the project folder, run:

```bash
npm install
npm run expo:start
```

Scan the displayed QR code with Expo Go. Keep the phone and computer on the same network. This runs the app from the development server; it does not create a standalone APK.

`npm run expo:start` clears Metro's transform cache before starting, helping ensure Expo Go receives the current JavaScript bundle. It does not erase the app's SQLite data or Firebase Auth session.

## 👤 Trying the app

The sign-in screen includes demo accounts for a student, tutor, and parent. They work offline and accept any password. New accounts and profile changes are stored locally on the device; Firebase synchronization is used when the project has native Firebase environment variables configured.

The native app includes role-specific home screens, tutor search and booking, session requests and status updates, tutor availability display, parent progress, profile editing, role switching, and the notification inbox.

---

## 📁 Key Expo Configuration Files Included

- **`app.json`**: Expo manifest configured with Android package name `com.tutorlink.app` and the Expo SQLite plugin.
- **`eas.json`**: EAS Build profiles configured with `buildType: "apk"` under the `preview` profile so it builds an installable APK instead of an AAB bundle.
- **`src/App.native.tsx`**: React Native app screens used by Android.
- **`src/services/nativeStorage.native.ts`**: SQLite-backed storage adapter for the existing application services on Android.
- **`src/services/nativeStorage.web.ts`**: Web platform stub; native SQLite storage is not loaded by the browser app.
