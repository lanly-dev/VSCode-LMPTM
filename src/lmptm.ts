import * as path from 'path'
import * as puppeteer from 'puppeteer-core'
import * as vscode from 'vscode'

import { Entry } from './interfaces'

import Buttons from './buttons'
import TreeviewProvider from './treeview'
import WhichChrome from './whichChrome'
import PptBrowser from './browser/pptBrowser'
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
    if (fw === 'puppeteer') Lmptm.launchPuppeteer(buttons, context)
    else Lmptm.launchPlaywright(buttons, context)
  }

  private static launchPlaywright(buttons: Buttons, context: vscode.ExtensionContext) {
    // Dynamically import playwright-core to avoid requiring it for Puppeteer users
    import('playwright-core').then(async playwright => {
      const args = ['--window-size=500,500']
      let cPath = vscode.workspace.getConfiguration().get('lmptm.browserPath')
      if (!cPath) {
        vscode.window.showInformationMessage('No browser path specified for Playwright.')
        return
      }
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

      Lmptm.launched = true
      playwright.chromium.launch({
        args,
        headless: false,
        executablePath: String(cPath)
      }).then(async (theB: any) => {
        buttons.setStatusButtonText('Running $(browser)')
        Lmptm.cssPath = path.join(context.extensionPath, 'dist', 'inject', 'style.css')
        Lmptm.jsPath = path.join(context.extensionPath, 'dist', 'inject', 'script.js')
        const contextPW = await theB.newContext()
        const defaultPages = await contextPW.pages()
        if (defaultPages.length > 0) await defaultPages[0].close()
        const PwrBrowser = (await import('./browser/pwrBrowser')).default
        Lmptm.activeBrowser = new PwrBrowser(theB, buttons, contextPW)
        vscode.commands.executeCommand('setContext', 'lmptm.launched', true)
        TreeviewProvider.refresh()
      }, (error: { message: string }) => {
        vscode.window.showErrorMessage(error.message)
        vscode.window.showInformationMessage('Playwright browser launch failed. 😲')
        vscode.commands.executeCommand('setContext', 'lmptm.launched', false)
        Lmptm.launched = false
      })
    }).catch(err => {
      vscode.window.showErrorMessage('Playwright is not installed. Please run "npm install playwright-core".')
      vscode.window.showErrorMessage(String(err))
    })
  }

  private static launchPuppeteer(buttons: Buttons, context: vscode.ExtensionContext) {
    const args = ['--window-size=500,500']
    const iArgs = ['--disable-extensions'] // enable extension
    if (vscode.workspace.getConfiguration().get('lmptm.userData')) {
      const uddir = vscode.workspace.getConfiguration().get('lmptm.userDataDirectory')
      if (uddir) args.push(`--user-data-dir=${vscode.workspace.getConfiguration().get('lmptm.userDataDirectory')}`)
      else {
        vscode.window.showInformationMessage('Please specify the user data directory or disable user data setting!')
        return
      }
    }

    let cPath = vscode.workspace.getConfiguration().get('lmptm.browserPath')
    if (!cPath) cPath = WhichChrome.getPaths().Chrome || WhichChrome.getPaths().Chromium

    if (!cPath) {
      vscode.window.showInformationMessage('No Chromium or Chrome browser found. 🤔')
      return
    }

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

    Lmptm.launched = true
    // console.log('#### Browser Launched ####')
    puppeteer.launch({
      args,
      defaultViewport: null,
      executablePath: String(cPath),
      headless: false,
      ignoreDefaultArgs: iArgs
    }).then(async (theB: puppeteer.Browser) => {
      buttons.setStatusButtonText('Running $(browser)')
      Lmptm.cssPath = path.join(context.extensionPath, 'dist', 'inject', 'style.css')
      Lmptm.jsPath = path.join(context.extensionPath, 'dist', 'inject', 'script.js')
      const defaultPages = await theB.pages()
      defaultPages[0].close() // evaluateOnNewDocument won't on this page
      Lmptm.activeBrowser = new PptBrowser(theB, buttons, await theB.createIncognitoBrowserContext())
      vscode.commands.executeCommand('setContext', 'lmptm.launched', true)
      TreeviewProvider.refresh()
    }, (error: { message: string }) => {
      vscode.window.showErrorMessage(error.message)
      vscode.window.showInformationMessage('Browser launch failed. 😲')
      vscode.commands.executeCommand('setContext', 'lmptm.launched', false)
      Lmptm.launched = false
    })
  }
}
