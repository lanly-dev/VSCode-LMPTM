'use strict'

interface Paths {
  [key: string]: string
}

// @ts-ignore
import * as karmaChromeLauncher from 'karma-chrome-launcher'

export class WhichChrome {
  public static getPaths() {
    const chromePaths: Paths = {}
    Object.keys(karmaChromeLauncher).forEach(key => {
      if (key.indexOf('launcher:') !== 0) return
      const info = karmaChromeLauncher[key] && karmaChromeLauncher[key][1] && karmaChromeLauncher[key][1].prototype
      if (!info) return
      chromePaths[info.name] = info.DEFAULT_CMD[process.platform] || null
    })
    return chromePaths
  }
}
