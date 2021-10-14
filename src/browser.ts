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
  public static launched: boolean = false
  public static playButtonCss = {
    soundcloud: '.playControl',
    spotify: '.control-button--circled',
    youtube: '.ytp-play-button',
    ytmusic: '#play-pause-button'
  }
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

      const links: any = vscode.workspace.getConfiguration().get('lmptm.startPages')
      if (links.length) {
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
        Browser.cssPath = path.join(context.extensionPath, 'dist', 'scripts', 'style.css')
        Browser.jsPath = path.join(context.extensionPath, 'dist', 'scripts', 'script.js')
        const defaultPages = await browser.pages()
        defaultPages[0].close() // evaluateOnNewDocument won't on this page
        const b = new Browser(browser, buttons, await browser.createIncognitoBrowserContext())
        Browser.activeBrowser = b
        Browser.launched = false
        TreeviewProvider.refresh()
      }, error => {
        vscode.window.showErrorMessage(error.message)
        vscode.window.showInformationMessage('Missing Chrome? 🤔')
        Browser.launched = false
      })
    }
  }

  constructor(browser: puppeteer.Browser, buttons: Buttons, incognitoContext: puppeteer.BrowserContext) {
    this.buttons = buttons
    this.currentBrowser = browser
    this.pages = undefined
    this.selectedPage = undefined
    this.incognitoContext = incognitoContext
    this.currentBrowser.on('targetcreated', target => this.update('page_created', target))
    this.currentBrowser.on('targetchanged', target => this.update('page_changed', target))
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
      case 'soundcloud':
      case 'ytmusic':
        this.selectedPage.keyboard.press('Space')
        break
      case 'spotify':
        // @ts-ignore
        this.selectedPage.evaluate(() => spotifyAction('play'))
        break
      case 'youtube':
        this.selectedPage.keyboard.press('k')
        break
    }
    this.buttons.setPlayButton('pause')
  }

  pause() {
    if (!this.selectedPage) return
    switch (this.selectedMusicPageBrand) {
      case 'soundcloud':
      case 'ytmusic':
        this.selectedPage.keyboard.press('Space')
        break
      case 'spotify':
        // @ts-ignore
        this.selectedPage.evaluate(() => spotifyAction('pause'))
        break
      case 'youtube':
        this.selectedPage.keyboard.press('k')
        break
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
        break
    }
    this.changeEventCheck()
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
        break
    }
    this.changeEventCheck()
  }

  async forward() {
    if (!this.selectedPage) return
    switch (this.selectedMusicPageBrand) {
      case 'youtube':
        await this.selectedPage.keyboard.press('ArrowRight')
        break
      default: { vscode.window.showInformationMessage(SEEK_MSG) }
    }
    this.changeEventCheck()
  }

  async backward() {
    if (!this.selectedPage) return
    switch (this.selectedMusicPageBrand) {
      case 'youtube':
        await this.selectedPage.keyboard.press('ArrowLeft')
        break
      default: { vscode.window.showInformationMessage(SEEK_MSG) }
    }
    this.changeEventCheck()
  }

  async toggle() {
    if (this.selectedPage) {
      const pStt = await this.getPlayingStatus(this.selectedPage)
      pStt.status === 'play' ? this.pause() : this.play()
    }
  }

  getTabTitle() {
    return this.selectedPage?.title()
  }

  async getDetails() {
    if (!this.pages) return
    const details: any[] = []
    for (const [i, p] of this.pages.entries()) {
      const d: any = {}
      try { // prevent error shows when browser is closed
        d.index = i
        d.title = await p.title()
        const { brand, status } = await this.getPlayingStatus(p)
        if (this.selectedPage && this.selectedPage === p) d.selected = true
        d.brand = brand
        d.status = status
        details.push(d)
      } catch (error) { break }
    }
    return details
  }

  async pickTab(e: any) {
    if (!this.pages) return
    const { index, brand } = e
    const pickedTab = this.pages[index]
    this.pause()
    this.update('pageSelected', pickedTab.target())
    if (pickedTab !== this.selectedPage) {
      if (this.selectedPage) this.resetButton()
      this.selectedPage = pickedTab
      this.selectedMusicPageBrand = brand
      this.buttons.displayPlayback(true)
      this.buttons.setStatusButtonText(await this.selectedPage.title())
      this.changeEventCheck()
    }
  }

  private async launchPages() {
    const links: any = vscode.workspace.getConfiguration().get('lmptm.startPages')
    if (links.length) {
      const p: any = []
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

  // The button doesn't show up on the 1st launch
  private injectHtml(page: puppeteer.Page) {
    page.evaluate((pickMsg: string) => {
      do {
        // @ts-ignore
        if (!window['injected']) {
          const b = document.createElement('button')
          b.innerHTML = pickMsg
          b.className = 'btn-pick-float'
          document.body.appendChild(b)
          // @ts-ignore
          window['injected'] = true
        }
      } while (!document.getElementsByTagName('body')[0])
    }, PICK_MSG)
  }

  private addScripts(page: puppeteer.Page) {
    page.addStyleTag({ path: Browser.cssPath })
    page.addScriptTag({ path: Browser.jsPath })
  }

  private async setupPageWatcher(page: puppeteer.Page) {
    page.evaluateOnNewDocument((pickMsg : string) => {
      window.onload = () => {
        // @ts-ignore
        if (!window['injected']) {
          const b = document.createElement('button')
          b.innerHTML = pickMsg
          b.className = 'btn-pick-float'
          document.body.appendChild(b)
          // @ts-ignore
          window['injected'] = true
        }
      }
    }, PICK_MSG)

    page.removeAllListeners('close')
    page.on('close', async () => {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))
      if (Browser.activeBrowser) this.update('page_closed', page.target())
    })

    // @ts-ignore
    if (!page._pageBindings.has('pageSelected')) {
      // @ts-ignore
      page.exposeFunction('pageSelected', async ({ brand }) => {
        this.pause()
        this.update('pageSelected', page.target())
        if (page !== this.selectedPage) {
          if (this.selectedPage) this.resetButton()
          this.selectedPage = page
          this.selectedMusicPageBrand = brand
          this.setupMusicPage()
          this.buttons.displayPlayback(true)
          this.buttons.setStatusButtonText(await this.selectedPage.title())
          this.changeEventCheck()
        }
      })
    }
  }

  private setupMusicPage() {
    const page = this.selectedPage
    if (!page) return
    const brand = this.selectedMusicPageBrand
    if (!brand) return

    // @ts-ignore
    if (!page._pageBindings.has('onPlayingChangeEvent')) {
      page.exposeFunction('onPlayingChangeEvent', () => {
        this.update('play_event', page.target())
      })
    }

    page.evaluate(playButtonCss => {
      const target = document.querySelector(playButtonCss)
      // @ts-ignore
      const observer = new MutationObserver(() => onPlayingChangeEvent())
      observer.observe(target, { attributes: true })
      // @ts-ignore
    }, Browser.playButtonCss[brand])

    if (brand === 'spotify') {
      page.evaluate(() => {
        const id = setInterval(() => {
          if (document.querySelectorAll('.now-playing .cover-art-image')[0]) {
            const target = document.querySelectorAll('.now-playing .cover-art-image')[0]
            // @ts-ignore
            const observer = new MutationObserver(() => onPlayingChangeEvent())
            observer.observe(target, { attributes: true })
            clearInterval(id)
          }
        }, 3000)
      })
    }
  }

  private async updatePages() {
    this.pages = await this.currentBrowser.pages()
    return this.pages[0]
  }

  private resetButton() {
    // @ts-ignore
    this.selectedPage?.evaluate(() => reset())
  }

  private async changeEventCheck() {
    if (!this.selectedPage) return
    const pStatus = await this.getPlayingStatus(this.selectedPage)
    if (pStatus.brand !== 'other') {
      this.selectedMusicPageBrand = pStatus.brand
      this.buttons.setPlayButton(pStatus.status)
      if (this.selectedPage)
        this.buttons.setStatusButtonText(await this.selectedPage.title())
    } else {
      if (this.selectedPage.url().includes('www.youtube.com')) this.resetButton() // See line 400
      this.buttons.setStatusButtonText('Running $(browser)')
      this.buttons.displayPlayback(false)
      this.selectedPage = undefined
      this.selectedMusicPageBrand = undefined
    }
  }

  private async getPlayingStatus(page: puppeteer.Page) {
    const pageBrand = this.musicBrandCheck(page.url())
    const { soundcloud, spotify, youtube, ytmusic } = Browser.playButtonCss
    let stt

    if (pageBrand === 'other' || !this.selectedPage) return { brand: pageBrand, status: '' }

    else if (pageBrand === 'soundcloud') {
      const element = await this.selectedPage.$(soundcloud)
      let text = await this.selectedPage.evaluate(element => element?.getAttribute('title'), element)
      if (text) stt = text.includes('Play') ? 'play' : 'pause'

    } else if (pageBrand === 'spotify') {
      const element = await this.selectedPage.$(spotify)
      let text = await this.selectedPage.evaluate(element => element?.getAttribute('title'), element)
      if (text) stt = text.includes('Play') ? 'play' : 'pause'

    } else if (pageBrand === 'youtube') {
      const element = await this.selectedPage.$(youtube)
      let text = await this.selectedPage.evaluate(element => element?.getAttribute('aria-label'), element)
      if (text) stt = text.includes('Play') ? 'play' : 'pause'

    } else if (pageBrand === 'ytmusic') {
      const element = await this.selectedPage.$(ytmusic)
      let text = await this.selectedPage.evaluate(element => element?.getAttribute('aria-label'), element)
      if (text) stt = text.includes('Play') ? 'play' : 'pause'
    }

    return { brand: pageBrand, status: stt }
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

  private async update(event: string, target: puppeteer.Target) {
    const page = await target.page()
    if (!page) return
    if (event === 'page_closed' && page === this.selectedPage) this.closeEventUpdate()

    else if (event === 'page_created') {
      if ((this.musicBrandCheck(page.url()) === 'spotify')) {
        this.setPageBypassCSP(page, 'true')
        page.goto(page.url())
      } else this.setPageBypassCSP(page, 'false')
      await this.setupPageWatcher(page)

      page.on('load', async () => {
        if (this.musicBrandCheck(page.url()) === 'spotify') await this.checkSpotifyCSP(page)
        this.injectHtml(page)
        this.addScripts(page)
        if (!(this.musicBrandCheck(page.url()) === 'other')) this.setupMusicPage()
      })
    }

    else if (event === 'page_changed') {
      await page.waitForNavigation()
      this.changeEventCheck()
    }

    else if (event === 'play_event') this.changeEventCheck()

    TreeviewProvider.refresh()
    this.updatePages()
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