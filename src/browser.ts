import * as path from 'path'
import * as pptCore from 'puppeteer-core'
import * as vscode from 'vscode'

import { default as pptExtra } from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'

import { Entry } from './interfaces'
import Buttons from './buttons'
import TreeviewProvider from './treeview'
import WhichChrome from './whichChrome'

const SEEK_MSG = 'Seeking backward/forward function is only work for Youtube videos. 💡'
const STATE_MSG = 'Please select the tab/page that either in playing or paused. 💡'

export default class Browser {
  public static activeBrowser: Browser | undefined
  public static cssPath: string
  public static jsPath: string
  public static launched = false
  private buttons: Buttons
  private currentBrowser: pptCore.Browser
  private incognitoContext: pptCore.BrowserContext
  private pagesStatus: Entry[]
  private selectedMusicBrand: string | undefined
  private selectedPage: pptCore.Page | undefined

  public static launch(buttons: Buttons, context: vscode.ExtensionContext) {
    if (!Browser.activeBrowser && !Browser.launched) {
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
      if (vscode.workspace.getConfiguration().get('lmptm.ignoreDisableSync')) iArgs.push('--disable-sync')

      let cPath = vscode.workspace.getConfiguration().get('lmptm.browserPath')
      if (!cPath) cPath = WhichChrome.getPaths().Chrome ?? WhichChrome.getPaths().Chromium

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
      Browser.launched = true
      pptExtra.use(StealthPlugin())
      pptExtra.use(AdblockerPlugin({ blockTrackers: true }))
      args.push('--incognito')
      pptExtra
        .launch({
          args,
          executablePath: String(cPath),
          headless: false,
        })
        .then(
          async browser => {
            buttons.setStatusButtonText('Running $(browser)')
            Browser.cssPath = path.join(context.extensionPath, 'dist', 'inject', 'style.css')
            Browser.jsPath = path.join(context.extensionPath, 'dist', 'inject', 'script.js')
            //@ts-ignore asdf
            Browser.activeBrowser = new Browser(browser, buttons, await browser.createBrowserContext())
            TreeviewProvider.refresh()
          },
          error => {
            vscode.window.showErrorMessage(error.message)
            vscode.window.showInformationMessage('Browser launch failed. 😲')
            Browser.launched = false
          }
        )
        .catch(error => {
          vscode.window.showErrorMessage(error.message)
          vscode.window.showInformationMessage('Browser launch failed. 😲')
        })
    }
  }

  constructor(browser: pptCore.Browser, buttons: Buttons, context: pptCore.BrowserContext) {
    this.buttons = buttons
    this.currentBrowser = browser as pptCore.Browser
    this.pagesStatus = []
    this.incognitoContext = context
    this.currentBrowser.on('targetcreated', async (target: pptCore.Target) =>
      this.update('page_created', await target.page())
    )
    this.currentBrowser.on('targetchanged', async (target: pptCore.Target) =>
      this.update('page_changed', await target.page())
    )
    // this.currentBrowser.on('targetdestroyed', target => this.update('page_destroyed', target))
    this.currentBrowser.on('disconnected', () => {
      this.buttons.setStatusButtonText('Launch $(rocket)')
      Browser.activeBrowser = undefined
      this.buttons.displayPlayback(false)
      TreeviewProvider.refresh()
      Browser.launched = false
      // console.debug('CLOSE')
    })
    // this.currentBrowser.process().once('close', () => console.debug('CLOSE!!!!!!!!'))
    this.launchPages()
  }

  // Toggle
  async playPause() {
    if (!this.selectedPage) return
    const { state } = await this.getPlaybackState(this.selectedPage)
    switch (this.selectedMusicBrand) {
      case 'soundcloud':
      case 'spotify':
      case 'ytmusic':
        this.selectedPage.keyboard.press('Space')
        break
      case 'youtube':
        this.selectedPage.keyboard.press('k')
    }
    this.buttons.setPlayButtonLabel(state)
  }

  async skip() {
    if (!this.selectedPage) return
    switch (this.selectedMusicBrand) {
      case 'soundcloud':
        await this.selectedPage.keyboard.down('ShiftLeft')
        await this.selectedPage.keyboard.press('ArrowRight')
        await this.selectedPage.keyboard.up('ShiftLeft')
        break
      case 'spotify':
        // @ts-ignore
        this.selectedPage.evaluate(() => spotifyAction('skip'))
        break
      case 'youtube':
        await this.selectedPage.keyboard.down('ShiftLeft')
        await this.selectedPage.keyboard.press('n')
        await this.selectedPage.keyboard.up('ShiftLeft')
        break
      case 'ytmusic':
        await this.selectedPage.keyboard.press('j')
    }
  }

  async back() {
    if (!this.selectedPage) return
    switch (this.selectedMusicBrand) {
      case 'soundcloud':
        await this.selectedPage.keyboard.down('ShiftLeft')
        await this.selectedPage.keyboard.press('ArrowLeft')
        await this.selectedPage.keyboard.up('ShiftLeft')
        break
      case 'spotify':
        // @ts-ignore
        this.selectedPage.evaluate(() => spotifyAction('back'))
        break
      case 'youtube':
        this.selectedPage.goBack()
        break
      case 'ytmusic':
        await this.selectedPage.keyboard.press('j')
    }
  }

  async forward() {
    if (!this.selectedPage) return
    switch (this.selectedMusicBrand) {
      case 'youtube':
        await this.selectedPage.keyboard.press('ArrowRight')
        break
      default:
        vscode.window.showInformationMessage(SEEK_MSG)
    }
  }

  async backward() {
    if (!this.selectedPage) return
    switch (this.selectedMusicBrand) {
      case 'youtube':
        await this.selectedPage.keyboard.press('ArrowLeft')
        break
      default:
        vscode.window.showInformationMessage(SEEK_MSG)
    }
  }

  getTabTitle() {
    return this.selectedPage?.title()
  }

  getPagesStatus() {
    return this.pagesStatus
  }

  async pickTab(index: number) {
    if (!this.pagesStatus) return
    await this.tabOrderUpdate()
    const { page, state } = this.pagesStatus[index]
    if (state === 'none') {
      vscode.window.showInformationMessage(STATE_MSG)
      return
    }
    this.update('page_selected:tab', page)
  }

  // ↓↓↓↓ Private methods ↓↓↓↓

  private async launchPages() {
    const links: string[] | undefined = vscode.workspace.getConfiguration().get('lmptm.startPages')
    if (links && links.length) {
      const p: Promise<pptCore.HTTPResponse>[] = []
      links.forEach(async (e: string) => {
        const pg = await this.newPage()
        if (!pg) return
        await pg.setDefaultNavigationTimeout(0)
        await pg.goto(e)
      })
      await Promise.all(p)
      // this.removeBlankPageAtStartup()
    }
    TreeviewProvider.refresh()
  }

  // Browser will close if the only tab close so remove blank page after other pages created
  // Don't want to deal with the default blank page
  private async removeBlankPageAtStartup() {
    const pages = await this.currentBrowser.pages()
    pages[0].close()
  }

  private async newPage() {
    const needIncognito = vscode.workspace.getConfiguration().get('lmptm.incognitoMode')
    if (needIncognito) return this.incognitoContext.newPage()
    else return this.currentBrowser.newPage()
  }

  private resetFloatButton() {
    // @ts-ignore
    this.selectedPage?.evaluate(() => reset())
  }

  private clickFloatButton(thePage: pptCore.Page) {
    // @ts-ignore
    thePage.evaluate(() => click())
  }

  private async tabOrderUpdate() {
    // Puppeteer doesn't keep track pages' order?
    const pages = await this.currentBrowser.pages()
    const newPagesStatus = []
    for (const [i, p] of pages.entries()) {
      for (const e of this.pagesStatus) {
        if (p !== e.page) continue
        e.index = i
        newPagesStatus.push(e)
      }
    }
    this.pagesStatus = newPagesStatus
    TreeviewProvider.refresh()
  }

  // Get from saved
  private getPlaybackState(page: pptCore.Page) {
    for (const e of this.pagesStatus) if (e.page === page) return e
    // when not found
    return this._getPlaybackState(page)
  }

  // Need this?
  private async _getPlaybackState(page: pptCore.Page) {
    const pageBrand = this.musicBrandCheck(page.url())
    const state = await page.evaluate(() => navigator.mediaSession.playbackState)
    return { brand: pageBrand, state }
  }

  private musicBrandCheck(url: string) {
    if (url.includes('soundcloud.com')) return 'soundcloud'
    else if (url.includes('open.spotify.com')) return 'spotify'
    else if (url.includes('www.youtube.com/watch')) return 'youtube'
    else if (url.includes('music.youtube.com')) return 'ytmusic'
    else return 'other'
  }

  private async update(event: string, page: pptCore.Page | null) {
    // console.debug('$$$$$$$$$', event)
    if (!page) return

    let extra
    if (event.includes('page_selected')) {
      [event, extra] = event.split(':')
      if (!extra) throw new Error('page_selected event needs source - tab|button')
    } else if (event.includes('playback_change')) {
      [event, extra] = event.split(':')
      if (!extra) throw new Error('playback_change event needs state - playing|paused|none')
    }

    switch (event) {
      case 'page_changed':
        await this.pageChanged(page)
        break
      case 'page_closed':
        this.pageClosed(page)
        break
      case 'page_created':
        await this.pageCreated(page)
        break
      case 'page_selected':
        await this.pageSelected(page, <string>extra)
        break
      case 'playback_changed':
        await this.playbackChanged(page, <string>extra)
        break
      default:
        vscode.window.showErrorMessage(`Unknown event - ${event}`)
    }
    TreeviewProvider.refresh()
  }

  private async pageChanged(page: pptCore.Page) {
    await page.waitForNetworkIdle() // this somehow prevents navigation error
    const pageURL = page.url()
    const brand = this.musicBrandCheck(pageURL)

    // Spotify needs bypass CSP
    // won't stick to another site (if go to another URL) after set
    if (brand === 'spotify') this.spotifyBypassCSP(page)

    const title = await page.title()

    for (const [i, e] of this.pagesStatus.entries()) {
      if (e.page !== page) continue
      if (this.selectedPage === page) this.selectedMusicBrand = brand
      if (brand === 'other') {
        this.pagesStatus[i].picked = false
        this.pagesStatus[i].state = 'none'
        this.closingHelper()
      }
      this.pagesStatus[i].brand = brand
      this.pagesStatus[i].title = title
    }
  }

  private pageClosed(page: pptCore.Page) {
    if (page === this.selectedPage) this.closingHelper()
    this.pagesStatus.forEach((e, i, arr) => {
      if (e.page !== page) return
      arr.splice(i, 1)
    })
  }

  private closingHelper() {
    this.buttons.displayPlayback(false)
    this.buttons.setStatusButtonText('Running $(browser)')
    this.selectedPage = undefined
    this.selectedMusicBrand = undefined
  }

  private async pageCreated(page: pptCore.Page) {
    const pageURL = page.url()
    const brand = pageURL === 'about:blank' ? 'other' : this.musicBrandCheck(pageURL)

    // Spotify needs bypass CSP
    if (brand === 'spotify') this.spotifyBypassCSP(page)

    let title = pageURL === 'about:blank' ? pageURL : await page.title()
    if (title === '') title = 'New Tab'

    const pages = await this.currentBrowser.pages()
    for (const [index, p] of pages.entries()) {
      if (p !== page) continue
      this.pagesStatus.splice(index, 0, { page, brand, index, state: 'none', picked: false, title })
    }

    page.on('load', async () => {
      if (await this.isDevTools(page)) return
      page.addStyleTag({ path: Browser.cssPath })
      page.addScriptTag({ path: Browser.jsPath })
    })

    page.removeAllListeners('close')
    page.on('close', async () => {
      // console.debug('page on CLOSE')
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))
      if (Browser.activeBrowser) this.update('page_closed', page)
    })

    page.exposeFunction('pageSelected', () => this.update('page_selected:button', page))
    page.exposeFunction('playbackChanged', (state: string) => this.update(`playback_changed:${state}`, page))
  }

  private async pageSelected(page: pptCore.Page, source: string) {
    this.buttons.displayPlayback(true)

    // Not sure why it can't detect or wait - the error below
    // rejected promise not handled within 1 second:
    // Error: Execution context is not available in detached frame "about:blank"
    // (are you trying to evaluate?)

    if (this.selectedPage) {
      const { state } = await this.getPlaybackState(this.selectedPage)
      if (this.selectedPage === page) {
        await this.playPause()
        return
      } else {
        this.pagesStatus.forEach(e => (e.page === this.selectedPage ? (e.picked = false) : null))
        if (source === 'button' && state === 'playing') await this.playPause()
        this.resetFloatButton()
      }
    }

    for (const [i, e] of this.pagesStatus.entries()) {
      if (e.page !== page) continue
      if (source === 'tab') {
        this.clickFloatButton(e.page) // this will trigger page_select:button
        break
      } else {
        this.selectedPage = e.page
        this.pagesStatus[i].picked = true
        this.selectedMusicBrand = this.musicBrandCheck(page.url())
        const title = await this.selectedPage.title()
        this.pagesStatus[i].title = title
        this.buttons.setStatusButtonText(title)
      }
    }
  }

  private async playbackChanged(page: pptCore.Page, state: string) {
    for (const [i, e] of this.pagesStatus.entries()) {
      if (e.page !== page) continue
      if (this.selectedPage === page) {
        this.buttons.setPlayButtonLabel(<MediaSessionPlaybackState>state)
        this.buttons.setStatusButtonText(await this.selectedPage.title())
      }
      this.pagesStatus[i].state = <MediaSessionPlaybackState>state
      this.pagesStatus[i].title = await page.title()
    }
  }

  private async spotifyBypassCSP(page: pptCore.Page) {
    if (await this.isDevTools(page)) return
    page.setBypassCSP(true)
    // for debugging
    await page.evaluate(() => sessionStorage.setItem('bypassCSP', 'true'))
    // this doesn't trigger page_changed again -> no infinity loop
    page.goto(page.url())
  }

  private async isDevTools(page: pptCore.Page) {
    const title = await page.title()
    return title === 'DevTools'
  }

  // private async sleep(ms: number = 1000) {
  //   await new Promise(resolve => setTimeout(() => resolve(), ms))
  // }
}
