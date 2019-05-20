# Platform Mobile App

- [Development](#development)
  - [Setup](#setup)
  - [iOS](#ios)
    - [Running in the simulator](#running-in-the-simulator)
    - [Running on-device](#running-on-device)
  - [Android](#android)
    - [Running in the emulator](#running-in-the-emulator)
- [Staging](#staging)
  - [Publishing to Expo](#publishing-to-expo)
  - [Running on-device](#running-on-device-1)
- [Production](#production)
  - [Publishing to Expo](#publishing-to-expo-1)
  - [Submitting a new build to the iOS App Store](#submitting-a-new-build-to-the-ios-app-store)
  - [Creating a test build to install in the iOS Simulator](#creating-a-test-build-to-install-in-the-ios-simulator)

## Development

### Setup

1. Install [Homebrew](https://brew.sh).
2. Install NVM and Yarn.

```
brew install nvm yarn
```

3. Install Node.

```
nvm install
```

4. Install packages.

```
nvm exec yarn install
```

5. Install [Xcode](https://itunes.apple.com/us/app/xcode/id497799835) to run in the iOS Simulator.
6. Install [Android Studio](https://developer.android.com/studio) to run in the Android Emulator.

### iOS

#### Running in the simulator

```
nvm exec yarn start
```

#### Running on-device

1. Install the [Expo mobile client app](https://itunes.com/apps/exponent) on your iOS device.

2. Log in to Expo if testing push notifications.

```
nvm exec expo login
```

3. Run

```
nvm exec yarn start
```

4. Scan the QR code emitted in the console output with the Camera app on your iOS device.

### Android

#### Running in the emulator

```
nvm exec yarn run android
```

## Staging

### Publishing to Expo

```
nvm exec yarn run publish:staging
```

### Running on-device

1. Log in to Expo in the Expo client app in the iOS Simulator or on-device.

2. Scan the QR code below with the Camera app on your iOS device.

![Staging QR code](https://files.slack.com/files-pri/T3D62PAK1-FCVEJ473R/staging.png)

## Production

### Publishing to Expo

1. Create a Git tag for the release.

```
git tag [DATE_AND_TIME]
```

2. Run

```
nvm exec yarn run publish:production
```

### Submitting a new build to the iOS App Store

1. Increment `version` in `package.json`.
2. Increment `expo.ios.buildNumber` and `expo.android.versionCode` in `app.json`.
3. Commit the changes.
4. Create a Git tag for the release.

```
git tag [DATE_AND_TIME]
```

5. Run

```
nvm exec yarn run build
```

6. [Download the build](https://expo.io/builds) once finished.
7. Upload the build to iTunes Connect with Application Loader.
8. Submit the app for review via iTunes Connect.

- Indicate [advertising identifier compliance](https://segment.com/docs/sources/mobile/ios/quickstart/#step-5-submitting-to-the-app-store) by selecting the following checkboxes:
  1. Attribute this app installation to a previously served advertisement
  2. Attribute an action taken within this app to a previously served advertisement
  3. I, _NAME_, confirm that this app, and any third party…

### Creating a test build to install in the iOS Simulator

1. Run

```
nvm exec expo build:ios --type simulator --no-publish
```

2. [Download the build](https://expo.io/builds) once finished.
3. Install the build in the simulator by running

```
xcrun simctl install booted [PATH_TO_APP]
```
