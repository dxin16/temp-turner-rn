# temp-turner-rn

## Introduction

Purdue Spring 2023 - ECE 49022 Section 2

This is the repo for Team 22's Temp Turner Mobile App (created in React Native). Most of the files contained are standard files that React Native requires to run. The main Temp Turner code implementation can be found in `TempTurner/src`.

## Setup

To begin working in this repo, the first thing to do is to set up the React Native Development Environment ([Link to Docs here](https://reactnative.dev/docs/environment-setup)).

Install Summary:
 - Node
 - Watchman
 - IOS Specific:
    - Ruby
    - Xcode
    - CocoaPods
 - Android Specific:
    - JDK (Zulu11)
    - Android Studio

## Running

After completing the Development Environment Setup, you should have this repo cloned. The following instructions are also available on the previously linked Docs.

Prepare two terminal windows/tabs. Both should be in the `TempTurner` directory. 

On the first terminal, call `npx react-native start` to initiate a metro server with watchman (this will take full control of the first terminal).

On the second terminal, you can perform everything else needed to run the code. First call `npx pod-install` to install CocoaPods for IOS. Then call `npx react-native run-ios` and/or `npx react-native run-android` depending on which emulators you have available.

The app should build on to the emulator and run when ready. The first build might take a little while, but it will be faster on subsequent ones.

Summary:
 - Terminal #1: `npx react-native start`
 - Terminal #2:
    - IOS Emulator: `npx pod-install` then `npx react-native run-ios`
    - Android Emulator: `npx react-native run-android`
    - You can continue to use this terminal for anything else you need.

## Development

The basic development process is to get the app running, then edit the files in `TempTurner/src`. Whenever you save these files, you should see the emulator update correspondingly. 

If you need new packages, call `npm i <package name>` then follow it with `npx pod-install`. 

If you want to debug code, I've only been able to make it work with the Android Emulator, but just "shake" the device (or call `adb shell input keyevent 82`). You should see something come up in Safari/Google Chrome, and follow those instructions.