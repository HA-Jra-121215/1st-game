# Shadow Escape: The Impossible World - Android Project & APK Guide

This directory contains the ready-to-build Android Studio project for **Shadow Escape: The Impossible World**.

## 🚀 3 Ways to Play on Android:

### Method 1: Instant 1-Tap Mobile Install (No Computer Needed!)
1. Open this game's URL on Google Chrome on your Android mobile device.
2. Tap the **"INSTALL APP"** button in the top navigation or game menu.
3. Or tap Chrome's three dots menu (`⋮`) -> **"Install app"** (or **"Add to Home Screen"**).
4. An icon will appear on your home screen. It launches in 100% fullscreen standalone mode with full hardware acceleration, offline support, vibration, and high-performance 3D graphics!

---

### Method 2: Build APK with Android Studio
1. Download or export this `/android` folder (you can also click **"Download Android Studio Project (.ZIP)"** in the in-game Android Hub).
2. Open **Android Studio** and select **"Open"**, then choose the `android` folder.
3. Wait 30 seconds for Gradle sync to complete.
4. In the top menu, go to:
   **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**.
5. Android Studio will compile `app-debug.apk`. Click **"locate"** in the popup notification to get your installable `.apk` file!
6. Transfer to your phone or run directly on your connected device by clicking the green **Run (▶)** button!

---

### Method 3: Command Line (Gradle)
```bash
cd android
./gradlew assembleDebug
```
The output APK is generated at:
`app/build/outputs/apk/debug/app-debug.apk`

Transfer this `.apk` to any Android phone via USB, Google Drive, or WhatsApp, tap to install, and enjoy!
