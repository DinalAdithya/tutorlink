# TutorLink

TutorLink is a peer tutoring app built with React Native and Expo. Students can find tutors and request sessions; tutors can manage requests; parents can view learning progress.

## Requirements

- Node.js and npm
- Expo Go on an Android device, or an Android emulator
- (Optional) An Expo account and EAS CLI to create Android builds

## Run with Expo Go

1. Clone this repository and open a terminal in its root folder.
2. Install dependencies:

   ```powershell
   npm install
   ```

3. Start Expo:

   ```powershell
   npm run expo:start
   ```

4. Open Expo Go on your Android device and scan the QR code displayed in the terminal or browser. Keep the computer and phone on the same network.

The start script clears Metro's cache before starting. If the installed Expo Go version is incompatible with this project's Expo SDK, install a compatible Expo Go version from [expo.dev/go](https://expo.dev/go).

## Run the web app

Install dependencies, then start the web development server:

```powershell
npm install
npm run dev
```

Open the local URL printed in the terminal.

## Firebase configuration (optional)

Firebase is used for live sign-in and cloud data. To enable it locally, provide these `EXPO_PUBLIC_FIREBASE_*` environment variables in a local `.env.local` file:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Use values from your Firebase project settings. Do not commit `.env.local` or private credentials. For EAS builds, configure the same variables in the EAS project's environment. Firestore access also depends on publishing the project's Firestore security rules.

Without Firebase configuration, the app can use its included demo accounts and local demo data.

## Download the Android APK

The latest shared EAS build is available on this page:

[Open TutorLink Android build](https://expo.dev/accounts/dinaladithya123s-team/projects/tutorlink/builds/15da639f-21bc-43d0-a8ae-52390b6fcf91)

Open the build page on an Android device and download the APK artifact. Android may ask you to allow installation from your browser or file manager.

## Create a new APK

Install or run the EAS CLI, sign in to the Expo account with access to this project, then build from the repository root:

```powershell
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

The `preview` profile is configured to produce an installable APK. EAS prints a build page link when the build is submitted; download the artifact from that page after the build finishes.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run expo:start` | Start the Expo Go development server and clear Metro's cache |
| `npm run dev` | Start the web development server |
| `npm run lint` | Run the TypeScript check |
| `npm run build` | Build the web app |
| `npx eas-cli build --platform android --profile preview` | Build an Android APK with EAS |
