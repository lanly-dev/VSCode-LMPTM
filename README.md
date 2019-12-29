# LetMePlayTheMusic README

[![Version](https://vsmarketplacebadge.apphb.com/version-short/lanly-dev.letmeplaythemusic.svg)](https://marketplace.visualstudio.com/items?itemName=lanly-dev.letmeplaythemusic)

Tired or get annoyed from switching windows in order to pause or skip a song?  
Doesn't want to or lazy to install the extra official players to the system?  
Want to stay focus on your programing instead of those distracting actions and feelings above?

If yes, you are in luck!  
This extension launches a Chrome/Chromium browser to the 3 popular music sites and you can control the playback from within your favorite Visual Studio Code editor.

[How to use it?](https://github.com/lanly-dev/VSCode-LMPTM/issues/1)

## Features

Supports Soundcloud, Spotify and Youtube

## Requirements

Required Chromium-based browser

## Extension Settings

* `lmptm.browserPath`: Specifies custom browser executable file path.
* `lmptm.incognitoMode`: Specifies whether to launch browser in incognito/private mode.
* `lmptm.userData`: Specifies if the extension could store browser's user data, if enabled, user data directory setting is required.
* `lmptm.userDataDirectory`: Specifies [user data directory](https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md), this will be ignored if **User Data** setting disabled.

## Known Issues

Errors may pop up (mostly happen in console) or functioning incorrectly if navigating too fast

## Release Notes

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
