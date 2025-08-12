import * as path from 'path'
import * as vscode from 'vscode'
import type { Browser as PuppeteerBrowser } from 'puppeteer-core'

import Buttons from './buttons'
import TreeviewProvider from './treeview'
import WhichChrome from './whichChrome'
import PptBrowser from './browser/pptBrowser'
import PwrBrowser from './browser/pwrBrowser'
import Browser from './browser/browser'

export default class Lmptm {
  public static SEEK_MSG = 'Seeking backward/forward function is only work for Youtube videos. 💡'
  public static STATE_MSG = 'Please select the tab/page that either in playing or paused. 💡'
  public static activeBrowser: Browser | undefined
  public static cssPath: string
  public static jsPath: string
  public static launched = false

  public static launch(buttons: Buttons, context: vscode.ExtensionContext) {
    if (Lmptm.activeBrowser || Lmptm.launched) {
      vscode.window.showWarningMessage('Browser is already launched, this should not happen. 🤔')
      return
    }
    const fw = vscode.workspace.getConfiguration().get('lmptm.framework')

    const links: string[] | undefined = vscode.workspace.getConfiguration().get('lmptm.startPages')
    if (links && links.length) {
      let invalid = false
      links.forEach((e: string) => {
        try { new URL(e) } catch (err) {
          invalid = true
          return
        }
      })
      if (invalid) {
        vscode.window.showErrorMessage('You may have an invalid url on startPages setting. 🤔')
        return
      }
    }
    Lmptm.cssPath = path.join(context.extensionPath, 'dist', 'inject', 'style.css')
    Lmptm.jsPath = path.join(context.extensionPath, 'dist', 'inject', 'script.js')

    if (fw === 'puppeteer') Lmptm.launchPuppeteer(buttons)
    else Lmptm.launchPlaywright(buttons)
  }

  private static async launchPlaywright(buttons: Buttons) {
    // Dynamically import playwright-core to avoid requiring it for Puppeteer users
    const playwright = await import('playwright-core')
    // persistent context doesn't honor --disable-web-security?
    const args = ['--window-size=500,500', '--disable-blink-features=AutomationControlled']

    let cPath = vscode.workspace.getConfiguration().get('lmptm.browserPath')
    if (!cPath) cPath = WhichChrome.getPaths().Chrome || WhichChrome.getPaths().Chromium

    if (!cPath) {
      vscode.window.showInformationMessage('No Chromium or Chrome browser found. 🤔')
      return
    }

    let uddir
    if (vscode.workspace.getConfiguration().get('lmptm.userData')) {
      uddir = vscode.workspace.getConfiguration().get('lmptm.userDataDirectory')
      if (!uddir) {
        vscode.window.showInformationMessage('Please specify the user data directory or disable user data setting!')
        return
      }
    }

    const opts = {
      args,
      headless: false,
      executablePath: String(cPath)
    }

    let contextPW
    let theB
    let isPersistent = false
    console.log(playwright)
    console.log(playwright.chromium)
    try {
      if (uddir) {
        // Launch persistent context with user data directory, can't make multiple tabs
        contextPW = await playwright.chromium.launchPersistentContext(String(uddir), opts)
        theB = contextPW.browser()
        isPersistent = true
      } else {
        theB = await playwright.chromium.launch(opts)
        // viewport: null to disable Playwright's default viewport override
        contextPW = await theB.newContext({ viewport: null })
      }
      Lmptm.activeBrowser = new PwrBrowser(theB!, buttons, contextPW, isPersistent)
      this.launchSuccess(buttons)
      // Lmptm.activeBrowser.closeBrowser()
    } catch (error: any) {
      this.launchFailed(error)
    }
  }

  private static async launchPuppeteer(buttons: Buttons) {
    const puppeteer = await import('puppeteer-core')
    const args = ['--window-size=500,500', '--disable-blink-features=AutomationControlled']
    const iArgs = ['--disable-extensions'] // enable extension

    if (vscode.workspace.getConfiguration().get('lmptm.userData')) {
      const uddir = vscode.workspace.getConfiguration().get('lmptm.userDataDirectory')
      if (!uddir) {
        vscode.window.showInformationMessage('Please specify the user data directory or disable user data setting!')
        return
      }
      args.push(`--user-data-dir=${uddir}`)
    }

    let cPath = vscode.workspace.getConfiguration().get('lmptm.browserPath')
    if (!cPath) cPath = WhichChrome.getPaths().Chrome || WhichChrome.getPaths().Chromium

    if (!cPath) {
      vscode.window.showInformationMessage('No Chromium or Chrome browser found. 🤔')
      return
    }

    const incognitoMode = vscode.workspace.getConfiguration().get('lmptm.incognitoMode') as boolean
    // Edge doesn't work with incognito mode
    if (incognitoMode) args.push('--incognito')
    puppeteer.launch({
      args,
      defaultViewport: null,
      executablePath: String(cPath),
      headless: false,
      ignoreDefaultArgs: iArgs
    }).then(async (theB: PuppeteerBrowser) => {
      Lmptm.activeBrowser = new PptBrowser(theB, buttons, incognitoMode)
      this.launchSuccess(buttons)
    }, this.launchFailed)
  }

  private static launchSuccess(buttons: Buttons) {
    Lmptm.launched = true
    buttons.setStatusButtonText('Running $(browser)')
    vscode.commands.executeCommand('setContext', 'lmptm.launched', true)
    TreeviewProvider.refresh()
  }

  private static launchFailed(error: any) {
    vscode.window.showErrorMessage(error?.message)
    vscode.window.showInformationMessage('Browser launch failed. 😲')
    vscode.commands.executeCommand('setContext', 'lmptm.launched', false)
    Lmptm.launched = false
  }
}
