# Change Log

All notable changes to the "LetMePlayTheMusic" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com) for recommendations on how to structure this file.

### References
- https://github.com/microsoft/vscode-generator-code/tree/main/generators/app/templates/ext-command-ts
- https://github.com/microsoft/vscode-extension-samples
- https://www.conventionalcommits.org

### TODO
- Brave setting removal
- I18n
- Playwright vs Puppeteer option
- Seek backward/forward setting option
- Shelljs vs Execa
- Support for other sites

## [2.0.0] - ??? 2021
- Add new feature - treeview
- Rewrite/refactor most of the code - 25+ commits
- New float button style
- Fix Spotify bug due to it's style class's changes
- Fix site English version issue - observes another DOM element to update playback status
- Merge play and pause commands into one toggle function
- Move most of the minor inject action to inject script instead
- Re-config project's configs like eslint, tsconfig, vscode setting, and webpack (.js -> .ts)
- Rename directories: icon -> media, script -> inject
- Playback icons is sync with the site's playback icons which was behaved contrarily before
### Note
#### This release mostly has more significant impact on the dev side rather than like a product update.
#### [MediaSession](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession)
- Soundcloud does update `playbackState` but only call `set` for from press play
- Spotify does call `set` to update metadata but playbackState always *none*
- Youtube and YTmusic update `playbackState` consistent with proxy `set` event

#### Puppeteer
- Seem Puppeteer doesn't keep track pages/tabs' order
- If click too quick, this shows up: `Error: Execution context is not available in detached frame "about:blank" (are you trying to evaluate?)`
  Waiting and try/catch was fruitless

## [1.4.0] - October 2020
- Add key shortcuts [#7](https://github.com/lanly-dev/VSCode-LMPTM/issues/7)
- Add seek 5s forward/backward key shortcuts for Youtube [#8](https://github.com/lanly-dev/VSCode-LMPTM/issues/8)
- Add support for Youtube Music
- Add startPages setting
- 11 files, 128.26KB, 1.50.0

## [1.3.0] - February 2020
- Add [ignoreDisableSync](https://github.com/puppeteer/puppeteer/blob/0b1777e73cb1e83ece9e09b7b51d11b798def06f/lib/Launcher.js#L277) setting [#3](https://github.com/lanly-dev/VSCode-LMPTM/issues/3#issuecomment-572180371), [#5](https://github.com/lanly-dev/VSCode-LMPTM/issues/5)
- Remove [Adblocker](https://github.com/cliqz-oss/adblocker/tree/master/packages/adblocker-puppeteer) - New version breaks webpack build
- Ignore [disable extension flag from puppeteer](https://github.com/puppeteer/puppeteer/blob/0b1777e73cb1e83ece9e09b7b51d11b798def06f/lib/Launcher.js#L270)
- Switch tslint to eslint in development
- 11 files, 141.77KB, 1.42.0

## [1.2.0] - December 2019
- Add browser executable file setting [#3](https://github.com/lanly-dev/VSCode-LMPTM/issues/3)
- Add Incognito/Private mode setting
- Add [User Data Directory](https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md) setting [#4](https://github.com/lanly-dev/VSCode-LMPTM/issues/4)
- 11 files, 192KB, 1.41.0

## [1.1.0] - October 2019
- Use [Adblocker](https://github.com/cliqz-oss/adblocker/tree/master/packages/adblocker-puppeteer)
- Improve extension package size with [Webpack](https://webpack.js.org) from 4.98MB (v1.0.0) to 226.1KB (v1.1.0)
- 11 files, 226.28KB, 1.39.0

## [1.0.0] - August 2019
- Initial release
- 2117 files, 5.09MB, 1.35.0
