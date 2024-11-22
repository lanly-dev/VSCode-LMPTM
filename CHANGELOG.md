# Change Log

All notable changes to the "LetMePlayTheMusic" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com) for recommendations on how to structure this file.

### References
- https://github.com/microsoft/vscode-generator-code/tree/main/generators/app/templates/ext-command-ts
- https://github.com/microsoft/vscode-extension-samples
- https://www.conventionalcommits.org

### TODO
- Playwright vs Puppeteer option
- Proxy feature?
- Seek backward/forward setting option
- Shelljs vs Execa
- Support for other sites

## [3.0.0] - November 2024
- Fix the [bug](https://github.com/lanly-dev/VSCode-LMPTM/blob/4018c50331d881bb7ec7f1e22e60967042b7ad07/src/browser.ts#L423) for CSP
- Add Chinese for treeview buttons
- Improve treeview with more buttons
- Migrate to ESlint@9
- ~~Stop using bundler~~
- Optimize SVGs again using [svgo](https://svgo.dev)
- Refer image from documentation to GitHub link to reduce extension size
- Remove setting for Brave browser
- Update logo<br>
  <img src='https://github.com/lanly-dev/VSCode-LMPTM/blob/3.0/media/vscodeignore/lmptm.png?raw=true' width='50' title='lmptm'/>
  <img src='https://github.com/lanly-dev/VSCode-LMPTM/blob/3.0/media/lmptm2.png?raw=true' width='55' title='lmptm2'/>

### Notes
- I18n isn't necessary
- It seems like the VSCode extension sample code has moved to use esbuild instead of webpack, but now it seems like you can pick either one
- ~~esbuild appears to be faster; however, after using webpack, it gave out errors every time the project was updated, and it was time-consuming to correct them --> this project doesn't use a bundler anymore~~ Have to bundle dependencies and esbuild doesn't support it --> back to webpack since *node_modules* is huge
- The logo has been changed for consistency with its menu vector
- Not sure if the Brave setting is still relevant
- webpack 5.96.1 compiled successfully in 17898 ms
- 14 files, 243.83 KB, 1.95.0

## [2.2.0] - September 2024
- Youtube CSP bypass [#15](https://github.com/lanly-dev/VSCode-LMPTM/issues/15)
- webpack 5.94.0 compiled successfully in 8730 ms
- 20 files, 1.4MB, 1.93.0

### Notes
- Chrome team added the [Trusted Types to YouTube](https://developer.chrome.com/blog/trusted-types-on-youtube) - thanks [Matthew](https://github.com/mattzgg) for the info
- There is probably a proper way to comply with the new security requirement but yeah, one shortcut is just to bypass it by disabling the [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- It seems like the webpack (in old project/machine) that used to publish this extension doesn't combine files, another package stats:
  - webpack 5.94.0 compiled successfully in 3000 ms
  - 15 files, 1.4MB, 1.93.0

## [2.1.0] - July 2024
- Fix Spotify and YouTube Music due to its UI change
- webpack 5.92.1 compiled successfully in 10241 ms
- 20 files, 1.4MB, 1.91.0

### Notes
- Updating this project to 3.0 was rough, so here is the minor release
- The Puppeteer@22 was having undesired bugs and behaviors
- Adding puppeteer-extra on top of it = more strange behaviors
- Why does Webpack's behavior change? - it doesn't combine files anymore

## [2.0.0] - December 2021
- Add new feature - treeview
- Rewrite/refactor most of the code - 30+ commits
- New float button style - old vs new in Windows<br>
  <img src='https://github.com/lanly-dev/VSCode-LMPTM/blob/6e3c7ffb704a8752bbef8c5c203213340182d012/media/vscodeignore/btn1.4.png?raw=true' width='100' title='btn1.4.png'/>
  <img src='https://github.com/lanly-dev/VSCode-LMPTM/blob/6e3c7ffb704a8752bbef8c5c203213340182d012/media/vscodeignore/btn2.0.png?raw=true' width='100' title='btn2.0.png'/>
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
