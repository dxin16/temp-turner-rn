# temp-turner-rn

## Introduction

Purdue Spring 2023 - ECE 49022 Section 2 - Team 22: The Temp Turner

This is the repo for our project's code. Most of the files contained are standard files that React Native requires to run. The main Temp Turner code implementation can be found in `TempTurner/src`. Code involving the ESP32 and the motor can be found in `Arduino_ESP32`.

## Current Progress (Mobile App)

As a brief summary of the files in `TempTurner/src`, most of the main content is in `CurrentBlock.js`, `TargetBlock.js`, and `ScheduleBlock.js`. These correspond to the three main blocks you see on the app screen when it loads. Using `ScheduleContext.js` makes it possible to coordinate the app's Blocks and Screens with each other.

For the other files, `App.js` is a high-level wrapper for the three blocks; it also sets up the ScheduleContext and contains the other screens for the app (Camera and Settings). `Styles.js` will include a style sheet that allows for dynamic changing of how the app looks depending on the device. It is currently not implemented yet. 

Main remaining goals:
 - Finish up http request integration
   - Manage request failures
 - Add in more graphics
   - Visual Indicators for temperature, smoke, time
   - App Icon and Splash Screen
   - Overall app appearance and style
 - Small fixes to input areas
 - Addition of off state
 - Indication when target temp isn't reached

Additional goals:
 - Implement `Styles.js` to accomodate many phone sizes
 - Storage of "recipes" / saved schedules

## Current Progress (ESP32 and Motor)
As a brief summary of files in `Arduino_ESP32`, `MainPart.ino` contains the implementation for the ESP32 to connect to WiFi, then host and maintain a web server. Motor control is implemented in `Motor.ino` and in the folder `Arduino_ESP32/fbss_mt_demo`.

Main remaining goals:

Additional goals:

## Working with the Mobile App / React Native

### Setup

To begin working with the mobile app, the first thing to do is to set up the React Native Development Environment ([Link to Docs here](https://reactnative.dev/docs/environment-setup)). I used Homebrew, as suggested by the docs, for many of the installs.

### Setup Summary
 - Node
 - Watchman
 - IOS Specific:
    - Ruby (rbenv)
    - Xcode (needs a Mac) (Provides IOS emulator)
    - CocoaPods
 - Android Specific:
    - JDK (Zulu11)
    - Android Studio (Provides Android emulator - needs setup)

### Running

After completing the Development Environment Setup, you should have this repo cloned. The following instructions are also available on the previously linked Docs.

Prepare two terminal windows/tabs. Both should be in the `TempTurner` directory. 

On the first terminal, call `npx react-native start` to initiate a metro server with watchman (this will take full control of the first terminal).

On the second terminal, you can perform everything else needed to run the code. I believe the first thing you have to do is call `npm install` on the packages I've used so far:
 - Follow the instructions [here.](https://reactnavigation.org/docs/getting-started/)
    - This is the package for navigating between screens.
 - Follow the instructions [here](https://docs.nativebase.io/install-rn) in the "Existing Project" tab.
    - This is the package used for basically all of the UI.
 - `npm install --save react-native-webview`
    - This is to access the camera, which will stream to an IP address on the local network.
 - The first two are links because they have multiple dependencies that need to be installed.

After installing the necessary packages, call `npx pod-install` to install pods for IOS. Then call `npx react-native run-ios` and/or `npx react-native run-android` depending on which emulators you have available.

The app should build onto the emulator and run when ready. The first build might take a little while, but it will be faster on subsequent ones.

Refer [here](https://reactnative.dev/docs/running-on-device) if you want to run on a physical device.

### Running Summary
 - Terminals in `TempTurner` directory
 - Terminal #1: `npx react-native start`
 - Terminal #2:
    - First install necessary packages
    - IOS Emulator: `npx pod-install` then `npx react-native run-ios`
    - Android Emulator: `npx react-native run-android`
    - You can continue to use this terminal for anything else you need.

After the first run, you will not need to call `npx pod-install` anymore until you install a new npm package.

### Development

The basic development process is to get the app running, then edit the files in `TempTurner/src`. Whenever you save these files, you should see the emulator update correspondingly. 

If you need new packages, generally you can call `npm i <package name>` (follow what the repo setup guide says) then follow it with `npx pod-install`. 

If you want to debug code, I've only been able to make it work with the Android Emulator, but just "shake" the device (or call `adb shell input keyevent 82`). Click on debug in the menu that pops up, and you should see something come up in Safari/Google Chrome.
