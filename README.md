# LetMePlayTheMusic README

[![Version](https://vsmarketplacebadge.apphb.com/version-short/lanly-dev.letmeplaythemusic.svg)](https://marketplace.visualstudio.com/items?itemName=lanly-dev.letmeplaythemusic)

Tired or get annoyed from switching windows in order to pause or skip a song?\
Doesn't want to or lazy to install the extra official players to the system?\
Want to stay focus on your programing instead of those distracting actions and feelings above?

If yes, you are in luck!\
This extension launches a Chrome/Chromium browser to the 4 popular music sites and you can control the playback from within your favorite Visual Studio Code editor.

Extra [use case](https://github.com/lanly-dev/VSCode-LMPTM/issues/8#issuecomment-661796089) - you could use this extension to follow programming tutorials on Youtube with the handy seek forward/backward key shortcuts.

[How to use it?](https://github.com/lanly-dev/VSCode-LMPTM/issues/1)

## Features

Supports SoundCloud, Spotify, Youtube and Youtube Music

## Requirements

Required Chromium-based browser

## Extension Settings

* `lmptm.browserPath`: Specify custom browser executable file path.
* `lmptm.ignoreDisableSync`: Ignore --disable-sync, this option is specifically for [Brave](https://brave.com) browser.
* `lmptm.incognitoMode`: Specify whether to launch browser in incognito/private mode.
* `lmptm.startPages`: Starting tabs.
* `lmptm.userData`: Specify if the extension could store browser's user data, if enabled, user data directory setting is required.
* `lmptm.userDataDirectory`: Specify [user data directory](https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md), this will be ignored if **User Data** setting is unchecked.

## Known Issues
- Work only with English version of the supported music sites
- Does not work with Opera browser
- Won't be able to login Youtube and SoundCloud(email method)

## Release Notes

### 1.4.0
- Add key shortcuts
- Add seek 5s forward/backward for Youtube shortcuts
- Add support for [Youtube Music](https://music.youtube.com/)
- Add startPages settings

### 1.3.0
- Remove adblocker
- Enable adding extensions for browser
- Add ignoreDisableSync setting option in order to able to launch [Brave](https://brave.com) browser

### 1.2.0
- Able to launch other Chromium-based browsers
- Able to launch browser in Incognito/Private mode
- Able to save user profile through [user data directory](https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md)

### 1.1.0
- Use adblocker
- Tiny extension size

### 1.0.0
- Initial release of LetMePlayTheMusic

**Enjoy!**
