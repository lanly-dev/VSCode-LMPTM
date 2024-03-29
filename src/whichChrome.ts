'use strict'

interface Paths {
  [key: string]: string
}

import * as karmaChromeLauncher from 'karma-chrome-launcher'

export class WhichChrome {
  public static getPaths() {
    const chromePaths: Paths = {}
    Object.keys(karmaChromeLauncher).forEach(key => {
      if (key.indexOf('launcher:') !== 0) return
      // @ts-ignore
      const info = karmaChromeLauncher[key][1].prototype
      if (!info) return
      chromePaths[info.name] = info.DEFAULT_CMD[process.platform] || null
    })
    return chromePaths
  }
}
