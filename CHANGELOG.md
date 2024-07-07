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

## [2.1.0] - July 2024
- Fix Spotify and YouTube Music due to its UI change
- webpack 5.92.1 compiled successfully in 10241 ms
- 20 files, 1.4MB, 1.91.0

### Note
- Updating this project to 3.0 was rough, so here is the minor release
- The Puppeteer@22 was having undesired bugs and behaviors
- Adding puppeteer-extra on top of it = more strange behaviors
- Why does Webpack's behavior change? - it doesn't combine files anymore

## [2.0.0] - December 2021
- Add new feature - treeview
- Rewrite/refactor most of the code - 30+ commits
- New float button style - old vs new in Windows
  <br><img src='./media/btn1.4.png' width='100'/> <img src='./media/btn2.0.png' width='100'/>
- Fix Spotify bug due to its style class's changes
- Fix site English version issue - observes another DOM element to update playback status
- Merge play and pause commands into one toggle function
- Move most of the minor inject action to inject script instead
- Re-config project's configs like eslint, tsconfig, vscode setting, and webpack (.js -> .ts)
- Rename directories: icon -> media, scripts -> inject
- Playback icons are synced with the site's playback icons, which behaved contrarily before
- Webpack 5.65.0 compiled successfully in 9980 ms
- 15 files, 1.39MB, 1.63.0

### Note

- This release mostly has a more significant impact on the dev side rather than a product update.
- One funny thing is that the picture in README.md accounts for a large part of this extension's size.

#### [MediaSession](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession)
- Soundcloud does update `playbackState` but only calls `set` from pressing play
- Spotify does call `set` to update metadata, but playbackState always *none*
- Youtube and YTmusic update `playbackState` consistent with proxy `set` event

#### Puppeteer
- It seems like Puppeteer doesn't keep track of pages/tabs' order
- If clicking too quickly, this shows up: `Error: Execution context is not available in detached frame "about:blank" (are you trying to evaluate?)`
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
- Ignore [disable extension flag from Puppeteer](https://github.com/puppeteer/puppeteer/blob/0b1777e73cb1e83ece9e09b7b51d11b798def06f/lib/Launcher.js#L270)
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
