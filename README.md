# temp-turner-rn

## Introduction

Purdue Spring 2023 - ECE 49022 Section 2

This is the repo for Team 22's Temp Turner Mobile App (created in React Native). Most of the files contained are standard files that React Native requires to run. The main Temp Turner code implementation can be found in `TempTurner/src`. Code involving the ESP32 can be found in `Arduino_ESP32`.

## Setup

To begin working in this repo, the first thing to do is to set up the React Native Development Environment ([Link to Docs here](https://reactnative.dev/docs/environment-setup)). I used Homebrew, as suggested by the docs, for many of the installs.

Install Summary:
 - Node
 - Watchman
 - IOS Specific:
    - Ruby (rbenv)
    - Xcode (needs a Mac)
    - CocoaPods
 - Android Specific:
    - JDK (Zulu11)
    - Android Studio

## Running

After completing the Development Environment Setup, you should have this repo cloned. The following instructions are also available on the previously linked Docs.

Prepare two terminal windows/tabs. Both should be in the `TempTurner` directory. 

On the first terminal, call `npx react-native start` to initiate a metro server with watchman (this will take full control of the first terminal).

On the second terminal, you can perform everything else needed to run the code. I believe the first thing you have to do is call `npm install` on the packages I've used so far:
 - `npm i @react-navigation/native`
 - `npm i react-native-screens react-native-safe-area-context`
    - These first two are packages for navigation, which I haven't used yet. They still need to be installed though.
 - `npm i native-base react-native-svg@12.1.1 react-native-safe-area-context@3.3.2`
    - This is the package used for basically all of the UI.
 - If I forgot to list any of them here, the name of a missing package should be specified in an error if there are any.

After installing the necessary packages, call `npx pod-install` to install pods for IOS. Then call `npx react-native run-ios` and/or `npx react-native run-android` depending on which emulators you have available.

The app should build onto the emulator and run when ready. The first build might take a little while, but it will be faster on subsequent ones.

Refer [here](https://reactnative.dev/docs/running-on-device) if you want to run on a physical device.

Summary:
 - Terminals in `TempTurner` directory
 - Terminal #1: `npx react-native start`
 - Terminal #2:
    - First install necessary packages
    - IOS Emulator: `npx pod-install` then `npx react-native run-ios`
    - Android Emulator: `npx react-native run-android`
    - You can continue to use this terminal for anything else you need.

After the first run, you will not need to call `npx pod-install` anymore until you install a new npm package.

## Development

The basic development process is to get the app running, then edit the files in `TempTurner/src`. Whenever you save these files, you should see the emulator update correspondingly. 

If you need new packages, call `npm i <package name>` then follow it with `npx pod-install`. 

If you want to debug code, I've only been able to make it work with the Android Emulator, but just "shake" the device (or call `adb shell input keyevent 82`). Click on debug in the menu that pops up, and you should see something come up in Safari/Google Chrome.

## Current Progress

For a brief summary of the files in `TempTurner/src`, most of the main content is in `CurrentBlock.js`, `TargetBlock.js`, and `ScheduleBlock.js`. These, of course, correspond to the three main blocks you see on the app screen when it loads. 

As for the other files, `App.js` is a high-level wrapper for the three blocks, and `Styles.js` will include a style sheet that allows for dynamic changing of how the app looks depending on the device. It is currently not implemented yet.

Main implementation goals:
 - Send and Receive data over WiFi with the ESP32
 - Update the app screen based on WiFi data
 - Finish up Scheduling Block implementation
 - Coordinate the Target Block with the Scheduling Block

Feature goals:
 - Implement `Styles.js`
 - Work on aesthetics (app icon, splash screen, home screen)
 - Storage of "recipes" / saved schedules
