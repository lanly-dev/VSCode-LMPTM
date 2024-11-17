# LetMePlayTheMusic [🔗](https://marketplace.visualstudio.com/items?itemName=lanly-dev.letmeplaythemusic)

Are you tired or annoyed from switching windows in order to pause or skip a song?\
Doesn't want to or lazy to install the extra official players to the system?\
Or perhaps your keyboard doesn't have the handy media hotkeys?\
Do you want to stay focused on your programming instead of those shortcomings above?

If yes, you are in luck!\
This extension launches a Chrome/Chromium browser to the 4 popular music sites, and you can control the playback from within your favorite Visual Studio Code editor.

>Extra [use case](https://github.com/lanly-dev/VSCode-LMPTM/issues/8#issuecomment-661796089) - you could use this extension to follow programming tutorials on Youtube with the handy seek forward/backward key shortcuts.

>[How to use it?](https://github.com/lanly-dev/VSCode-LMPTM/issues/1)

<img src='https://raw.githubusercontent.com/lanly-dev/VSCode-LMPTM/refs/heads/3.0/media/vscodeignore/capture2.0.png' width='700'/>

## Features
Supports SoundCloud, Spotify, YouTube, and YouTube Music

## Requirements
- Required Chromium-based browser
- [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) is disabled for Spotify, Youtube, and Youtube Music

## Extension Settings
* `lmptm.browserPath`: Specify custom browser executable file path.
* `lmptm.incognitoMode`: Specify whether to launch the browser in incognito/private mode.
* `lmptm.startPages`: Starting tabs.
* `lmptm.userData`: Specify if the extension could store the browser's user data; if enabled, a user-data directory setting is required.
* `lmptm.userDataDirectory`: Specify [user data directory](https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md). This setting will be ignored if **User Data** setting is unchecked.

## Known Issues
- Does not work with Opera browser
- Won't be able to log into YouTube and SoundCloud(email method)

## Release Notes
### 2.2.0
- CSP bypass for Youtube and Youtube Music

### 2.1.0
- Fix Spotify and YouTube Music for its UI changes

### 2.0.0
- Fix Spotify bugs for its UI changes
- Add treeview - so now the app can switch between tabs
  1. The page has to be picked before being able to be used in the treeview
  2. You can select the treeview items that have  the play/pause icon
  3. The emoji ⛏️ means the tab is currently picked
  4. The first click switches the picked icon to the target tab, and the clicks that come after toggle the playing/paused status of the target tab media's playback

### 1.4.0
- Add key shortcuts
- Add seek 5s forward/backward for Youtube shortcuts
- Add support for [Youtube Music](https://music.youtube.com/)
- Add startPages settings

### 1.3.0
- Remove adblocker
- Enable adding extensions for the browser
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
