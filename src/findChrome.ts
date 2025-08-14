'use strict'
import { Launcher } from 'chrome-launcher'

// C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
// C:\Program Files\CocCoc\Browser\Application\browser.exe

export default class FindChrome {
  public static getPaths() {
    const installations = Launcher.getInstallations()
    return installations[0]
  }
}
