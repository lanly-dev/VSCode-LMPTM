'use strict'
import * as karmaChromeLauncher from 'karma-chrome-launcher'

export default class WhichChrome {
  public static getPaths() {
    const chromePaths: { [key: string]: string } = {}
    Object.keys(karmaChromeLauncher).forEach(key => {
      if (key.indexOf(`launcher:`) !== 0) return
      // @ts-ignore
      const info = karmaChromeLauncher[key][1].prototype
      if (!info) return
      chromePaths[info.name] = info.DEFAULT_CMD[process.platform] || null
    })
    return chromePaths
  }
}
