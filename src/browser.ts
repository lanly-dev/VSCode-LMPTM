import * as path from 'path'
import * as puppeteer from 'puppeteer-core'
import * as vscode from 'vscode'

import { Buttons } from './buttons'
import { TreeviewProvider } from './treeview'
import { WhichChrome } from './whichChrome'

const SEEK_MSG = 'Seeking backward/forward function is only work for Youtube videos'
const PICK_MSG = '⛏️ Pick?'

export class Browser {
  public static activeBrowser: Browser | undefined
  public static cssPath: string
  public static jsPath: string
  public static launched = false
  private pagesStatus: []
  private buttons: Buttons
  private currentBrowser: puppeteer.Browser
  private incognitoContext: puppeteer.BrowserContext
  private pages: puppeteer.Page[] | undefined
  private selectedMusicPageBrand: string | undefined
  private selectedPage: puppeteer.Page | undefined

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
      if (!cPath) cPath = WhichChrome.getPaths().Chrome || WhichChrome.getPaths().Chromium

      if (!cPath) {
        vscode.window.showInformationMessage('Missing Browser! 🤔')
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
          vscode.window.showErrorMessage('You may have an invalid url on startPages setting! 🤔')
          return
        }
      }

      Browser.launched = true
      puppeteer.launch({
        args,
        defaultViewport: null,
        executablePath: String(cPath),
        headless: false,
        ignoreDefaultArgs: iArgs
      }).then(async (browser: puppeteer.Browser) => {
        buttons.setStatusButtonText('Running $(browser)')
        Browser.cssPath = path.join(context.extensionPath, 'out', 'inject', 'style.css')
        Browser.jsPath = path.join(context.extensionPath, 'out', 'inject', 'script.js')
        const defaultPages = await browser.pages()
        defaultPages[0].close() // evaluateOnNewDocument won't on this page
        const b = new Browser(browser, buttons, await browser.createIncognitoBrowserContext())
        Browser.activeBrowser = b
        Browser.launched = false
        TreeviewProvider.refresh()
      }, (error: { message: string }) => {
        vscode.window.showErrorMessage(error.message)
        vscode.window.showInformationMessage('Missing Chrome? 🤔')
        Browser.launched = false
      })
    }
  }

  constructor(browser: puppeteer.Browser, buttons: Buttons, incognitoContext: puppeteer.BrowserContext) {
    this.buttons = buttons
    this.currentBrowser = browser
    this.pagesStatus = []
    this.incognitoContext = incognitoContext
    this.currentBrowser.on('targetcreated', async (target: puppeteer.Target) => this.update('page_created', await target.page()))
    this.currentBrowser.on('targetchanged', async (target: puppeteer.Target) => this.update('page_changed', await target.page()))
    // this.currentBrowser.on('targetdestroyed', target => this.update('page_destroyed',target))
    this.currentBrowser.on('disconnected', () => {
      TreeviewProvider.refresh()
      this.buttons.setStatusButtonText('Launch $(rocket)')
      Browser.activeBrowser = undefined
      this.buttons.displayPlayback(false)
      // console.debug('CLOSE')
    })
    // this.currentBrowser.process().once('close', () => console.debug('CLOSE!!!!!!!!'))
    this.launchPages()
  }

  play() {
    if (!this.selectedPage) return
    switch (this.selectedMusicPageBrand) {
      case 'soundcloud': case 'ytmusic':
        this.selectedPage.keyboard.press('Space')
        break
      case 'spotify':
        // @ts-ignore
        this.selectedPage.evaluate(() => spotifyAction('play'))
        break
      case 'youtube':
        this.selectedPage.keyboard.press('k')
    }
    this.buttons.setPlayButton('pause')
  }

  pause() {
    if (!this.selectedPage) return
    switch (this.selectedMusicPageBrand) {
      case 'soundcloud': case 'ytmusic':
        this.selectedPage.keyboard.press('Space')
        break
      case 'spotify':
        // @ts-ignore
        this.selectedPage.evaluate(() => spotifyAction('pause'))
        break
      case 'youtube':
        this.selectedPage.keyboard.press('k')
    }
    this.buttons.setPlayButton('play')
  }

  async skip() {
    if (!this.selectedPage) return
    switch (this.selectedMusicPageBrand) {
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
    switch (this.selectedMusicPageBrand) {
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
    switch (this.selectedMusicPageBrand) {
      case 'youtube':
        await this.selectedPage.keyboard.press('ArrowRight')
        break
      default: vscode.window.showInformationMessage(SEEK_MSG)
    }
  }

  async backward() {
    if (!this.selectedPage) return
    switch (this.selectedMusicPageBrand) {
      case 'youtube':
        await this.selectedPage.keyboard.press('ArrowLeft')
        break
      default: vscode.window.showInformationMessage(SEEK_MSG)
    }
  }

  async toggle() {
    if (this.selectedPage) {
      const pStt = await this.getPlaybackState(this.selectedPage)
      pStt.state === 'playing' ? this.pause() : this.play()
    }
  }

  getTabTitle() {
    return this.selectedPage?.title()
  }

  getPagesStatus() {
    return this.pagesStatus
  }

  async pickTab(index: number) {
    if (!this.pages) return
    const pickedTab: puppeteer.Page = this.pages[index]
    this.pause()
    this.update('page_selected', pickedTab)
  }

  // ↓↓↓↓ Private methods ↓↓↓↓

  private async launchPages() {
    const links: string[] | undefined = vscode.workspace.getConfiguration().get('lmptm.startPages')
    if (links && links.length) {
      const p: unknown[] = []
      links.forEach(async (e: string) => {
        const pg = await this.newPage()
        await pg.setDefaultNavigationTimeout(0)
        p.push(pg.goto(e))
      })
      await Promise.all(p)
    }
    this.pages = await this.currentBrowser.pages()
  }

  private async newPage() {
    const needIncognito = vscode.workspace.getConfiguration().get('lmptm.incognitoMode')
    if (needIncognito) return this.incognitoContext.newPage()
    else return this.currentBrowser.newPage()
  }

  private addScripts(page: puppeteer.Page) {
    page.addStyleTag({ path: Browser.cssPath })
    page.addScriptTag({ path: Browser.jsPath })
  }

  private async setupPageWatcher(page: puppeteer.Page) {
    page.evaluateOnNewDocument((pickMsg: string) => {
      window.onload = () => {
        // @ts-ignore
        if (window['injected']) return
        const b = document.createElement('button')
        b.innerHTML = pickMsg
        b.className = 'btn-pick-float'
        document.body.appendChild(b)
        // @ts-ignore
        window['injected'] = true
      }
    }, PICK_MSG)

    page.removeAllListeners('close')
    page.on('close', async () => {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))
      if (Browser.activeBrowser) this.update('page_closed', page)
    })

    // @ts-ignore
    if (!page._pageBindings.has('pageSelected'))
      page.exposeFunction('pageSelected', () => this.update('page_selected', page))

    // @ts-ignore
    if (!page._pageBindings.has('playbackChanged'))
      page.exposeFunction('playbackChanged', (state: string) => this.update('playback_changed', page, state))
  }

  private resetButton() {
    // @ts-ignore
    this.selectedPage?.evaluate(() => reset())
  }

  // private async updatePlaybackState(page, state) {
  //   const pStatus = await this.getPlaybackState(this.selectedPage)
  //   if (pStatus.brand !== 'other') {
  //     this.selectedMusicPageBrand = pStatus.brand
  //     this.buttons.setPlayButton(pStatus.state)
  //     if (this.selectedPage) this.buttons.setStatusButtonText(await this.selectedPage.title())
  //   } else {
  //     if (this.selectedPage.url().includes('www.youtube.com')) this.resetButton() // See line 364
  //     this.buttons.setStatusButtonText('Running $(browser)')
  //     this.buttons.displayPlayback(false)
  //     this.selectedPage = undefined
  //     this.selectedMusicPageBrand = undefined
  //   }
  // }

  // Get from saved
  private getPlaybackState(page: puppeteer.Page) {
    for (const p of this.pagesStatus)
      if (p === page) return p
    // when not found
    return this._getPlaybackState(page)
  }

  private async _getPlaybackState(page: puppeteer.Page) {
    const pageBrand = this.musicBrandCheck(page.url())
    await page.waitForNavigation() // page_changed?
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

  private async closeEventUpdate() {
    this.buttons.setPlayButton('play')
    this.buttons.displayPlayback(false)
    this.buttons.setStatusButtonText('Running $(browser)')
    this.selectedPage = undefined
    this.selectedMusicPageBrand = undefined
  }

  private async update(event: string, page: puppeteer.Page | null, state?) {
    if (!page) return

    switch (event) {
      case 'page_closed':
        if (page === this.selectedPage) this.closeEventUpdate()
        break
      case 'page_created': {
        const brand = this.musicBrandCheck(page.url())

        // TODO: need note
        if (brand === 'spotify') {
          this.setPageBypassCSP(page, 'true')
          page.goto(page.url())
        } else this.setPageBypassCSP(page, 'false')
        await this.setupPageWatcher(page)

        page.on('load', async () => {
          if (brand === 'spotify') await this.checkSpotifyCSP(page)
          this.addScripts(page)
        })
        break
      }
      case 'page_changed':
        await page.waitForNavigation()
        break
      case 'page_selected':
        break
      case 'playback_changed':
        break
      default:
        vscode.window.showErrorMessage(`Unknown event - ${event}`)
    }

    TreeviewProvider.refresh()
    this.updatePages(page, event)
  }

  private async updatePages(targetPage: puppeteer.Page, event: string) {
    // TODO update thing depend on event
    console.debug(event)
    this.pages = await this.currentBrowser.pages()
    if (!this.pagesStatus.length) {
      //@ts-ignore
      this.pagesStatus = (await Promise.all(this.pages.map(async (page: puppeteer.Page) => {
        const { brand, state } = await this._getPlaybackState(page)
        let picked = false
        if (this.selectedPage && this.selectedPage === targetPage) picked = true
        const title = await page.title()
        return { page, title, brand, state, picked }
      }))).filter(Boolean)
    } else {
      for (let i = 0; i < this.pagesStatus.length; i++) {
        //@ts-ignore
        if (this.pagesStatus[i].page !== targetPage) continue
        const { page }: { page: puppeteer.Page } = this.pagesStatus[i]
        const { brand, state } = await this._getPlaybackState(page)
        let picked = false
        if (this.selectedPage && this.selectedPage === targetPage) picked = true
        const title = await page.title()
        //@ts-ignore
        this.pagesStatus[i] = { page, title, brand, state, picked }
        break
      }
    }
  }

  private async setPageBypassCSP(page: puppeteer.Page, flag: string) {
    if (page.url() === 'about:blank') return
    page.setBypassCSP(flag === 'true')
    await page.evaluate(theFlag => sessionStorage.setItem('bypassCSP', theFlag), flag)
  }

  private async checkSpotifyCSP(page: puppeteer.Page) {
    const cspFlag = await page.evaluate(() => sessionStorage.getItem('bypassCSP'))
    if (cspFlag === 'true') return
    await this.setPageBypassCSP(page, 'true')
    await page.reload()
  }

  // private async sleep(ms: number = 1000) {
  //   await new Promise(resolve => setTimeout(() => resolve(), ms))
  // }
}
