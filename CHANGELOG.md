# Change Log

All notable changes to the "LetMePlayTheMusic" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com) for recommendations on how to structure this file.

### TODO
- Brave setting removal
- I18n
- Look into mediaSession playbackState
- Playwright vs Puppeteer option
- Shelljs vs Execa
- Site English version issue
- Support for other sites
- Treeview

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
