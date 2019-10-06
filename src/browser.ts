import * as puppeteer from 'puppeteer-core'
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

import { Buttons } from './buttons'
import { WhichChrome } from './whichChrome'

export class Browser {

  public static activeBrowser: Browser | undefined
  public static launched: boolean = false
  public static cssPath: string
  public static jsPath: string
  public static uiHtmlPath: string
  public static faCssPath: string
  public static faJsPath: string
  public static playButtonCss = {
    soundcloud: '.playControl',
    spotify: '.control-button--circled',
    youtube: '.ytp-play-button'
  }
  private currentBrowser: puppeteer.Browser
  private pages: puppeteer.Page[] | undefined
  private selectedPage: puppeteer.Page | undefined
  private selectedMusicPageBrand: string | undefined
  private buttons: Buttons

  // @ts-ignore
  public static launch(buttons: Buttons, context: vscode.ExtensionContext) {
    const cPath = WhichChrome.getPaths().Chrome || WhichChrome.getPaths().Chromium
    if (!cPath) return void vscode.window.showInformationMessage('Missing Chrome? 🤔')
    if (!Browser.activeBrowser && !Browser.launched) {
      Browser.launched = true
      puppeteer.launch({
        executablePath: cPath,
        headless: false,
        defaultViewport: null,
        args: ['--incognito', '--window-size=500,500'],
        ignoreDefaultArgs: ['--mute-audio', '--hide-scrollbars']
      }).then(async browser => {
        buttons.setStatusButtonText('Running $(browser)')
        Browser.cssPath = path.join(context.extensionPath, 'out', 'scripts', 'style.css')
        Browser.jsPath = path.join(context.extensionPath, 'out', 'scripts', 'script.js')
        Browser.faCssPath = path.join(context.extensionPath, 'node_modules', '@fortawesome', 'fontawesome-free', 'css', 'all.min.css')
        Browser.faJsPath = path.join(context.extensionPath, 'node_modules', '@fortawesome', 'fontawesome-free', 'js', 'all.min.js')
        Browser.uiHtmlPath = fs.readFileSync(path.join(context.extensionPath, 'out', 'scripts', 'ui.html'), 'utf8')
        const defaultPages = await browser.pages()
        defaultPages[0].close() // evaluateOnNewDocument won't on this page
        Browser.activeBrowser = new Browser(browser, buttons)
        Browser.launched = false
      }, error => {
        vscode.window.showErrorMessage(error.message)
        vscode.window.showInformationMessage('Missing Chrome? 🤔')
        Browser.launched = false
      })
    }
  }

  constructor(browser: puppeteer.Browser, buttons: Buttons) {
    this.buttons = buttons
    this.currentBrowser = browser
    this.pages = undefined
    this.selectedPage = undefined
    this.currentBrowser.on('targetcreated', target => this.update('page_created', target))
    this.currentBrowser.on('targetchanged', target => this.update('page_changed', target))
    // this.currentBrowser.on('targetdestroyed', target => this.update('page_destroyed',target))
    this.currentBrowser.on('disconnected', () => {
      this.buttons.setStatusButtonText('Launch $(rocket)')
      Browser.activeBrowser = undefined
      this.buttons.dipslayPlayback(false)
    })
    this.launchPages()
  }

  play() {
    if (!this.selectedPage) return
    switch (this.selectedMusicPageBrand) {
      case 'soundcloud':
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
    }
    this.changeEventCheck()
  }

  getTabTitle() {
    // @ts-ignore
    return this.selectedPage.title()
  }

  private async launchPages() {
    const page1 = await this.currentBrowser.newPage()
    const page2 = await this.currentBrowser.newPage()
    const page3 = await this.currentBrowser.newPage()
    const p1 = page1.goto('https://soundcloud.com')
    const p2 = page2.goto('https://youtube.com')
    const p3 = page3.goto('https://open.spotify.com')
    await Promise.all([p1, p2, p3])
    this.pages = await this.currentBrowser.pages()
  }

  // The button doesn't show up on the 1st launch
  private injectHtml(page: puppeteer.Page) {
    page.evaluate(uiHtmlPath => {
      do {
        // @ts-ignore
        if (!window['injected']) {
          const div = document.createElement('div')
          div.innerHTML = uiHtmlPath
          document.getElementsByTagName('body')[0].appendChild(div)
          // @ts-ignore
          window['injected'] = true
        }
      } while (!document.getElementsByTagName('body')[0])
    }, Browser.uiHtmlPath)
  }
  private addScripts(page: puppeteer.Page) {
    page.addStyleTag({ path: Browser.cssPath })
    page.addScriptTag({ path: Browser.jsPath })
    page.addStyleTag({ path: Browser.faCssPath })
    page.addScriptTag({ path: Browser.faJsPath })
  }

  private async setupPageWatcher(page: puppeteer.Page) {
    // @ts-ignore
    page.evaluateOnNewDocument(uiHtmlPath => {
      window.onload = () => {
        // @ts-ignore
        if (!window['injected']) {
          const div = document.createElement('div')
          div.innerHTML = uiHtmlPath
          document.getElementsByTagName('body')[0].appendChild(div)
          // @ts-ignore
          window['injected'] = true
        }
      }
    }, Browser.uiHtmlPath)


    page.removeAllListeners('close')
    page.on('close', async () => {
      await new Promise(resolve => setTimeout(() => resolve(), 1000))
      if (Browser.activeBrowser) this.update('page_closed', page.target())
    })

    // @ts-ignore
    if (!page._pageBindings.has('pageSelected')) {
      page.exposeFunction('pageSelected', async e => {
        this.update('pageSelected', page.target())
        if (page !== this.selectedPage) {
          if (this.selectedPage) this.resetButton()
          this.selectedPage = page
          this.selectedMusicPageBrand = e.brand
          this.setupMusicPage()
          this.buttons.dipslayPlayback(true)
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
      // @ts-ignore
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
            // @ts-ignore
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
    this.selectedPage.evaluate(() => reset())
  }

  private async changeEventCheck() {
    if (!this.selectedPage) return
    const pStatus = await this.getPlayingStatus(this.selectedPage)
    if (pStatus.brand !== 'other') {
      this.selectedMusicPageBrand = pStatus.brand
      this.buttons.setPlayButton(pStatus.status)
      this.buttons.setStatusButtonText(await this.selectedPage.title())
    } else {
      if (this.selectedPage.url().includes('youtube.com')) this.resetButton()
      this.buttons.setStatusButtonText('Running $(browser)')
      this.buttons.dipslayPlayback(false)
      this.selectedPage = undefined
      this.selectedMusicPageBrand = undefined
    }
  }

  private async getPlayingStatus(page: puppeteer.Page) {
    const pageBrand = this.musicBrandCheck(page.url())
    if (pageBrand === 'other' || !this.selectedPage) {
      return { brand: pageBrand, status: '' }

    } else if (pageBrand === 'soundcloud') {
      const element = await this.selectedPage.$(Browser.playButtonCss.soundcloud)
      const text = await this.selectedPage.evaluate(element => element.getAttribute('title'), element)
      const stt = text.includes('Play') ? 'play' : 'pause'
      return { brand: pageBrand, status: stt }

    } else if (pageBrand === 'spotify') {
      const element = await this.selectedPage.$(Browser.playButtonCss.spotify)
      const text = await this.selectedPage.evaluate(element => element.getAttribute('title'), element)
      const stt = text.includes('Play') ? 'play' : 'pause'
      return { brand: pageBrand, status: stt }

    } else if (pageBrand === 'youtube') {
      const element = await this.selectedPage.$(Browser.playButtonCss.youtube)
      const text = await this.selectedPage.evaluate(element => element.getAttribute('aria-label'), element)
      if (!text) return { brand: pageBrand, status: 'play' } // When replay
      const stt = text.includes('Play') ? 'play' : 'pause'
      return { brand: pageBrand, status: stt }
    }
    else return { brand: pageBrand, status: '' }
  }

  private musicBrandCheck(url: string) {
    if (url.includes('soundcloud.com')) return 'soundcloud'
    else if (url.includes('open.spotify.com')) return 'spotify'
    else if (url.includes('youtube.com/watch')) return 'youtube'
    else return 'other'
  }

  private async closeEventUpdate() {
    this.buttons.setPlayButton('play')
    this.buttons.dipslayPlayback(false)
    this.buttons.setStatusButtonText('Running $(browser)')
    this.selectedPage = undefined
    this.selectedMusicPageBrand = undefined
  }

  private async update(event: string, target: puppeteer.Target) {
    const page = await target.page()
    if (!page) return

    if (event === 'page_closed') {
      if (page === this.selectedPage) this.closeEventUpdate()
      else this.updatePages()
    }

    else if (event === 'page_created') {
      page.setMaxListeners(3)
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

  private async sleep(ms: number = 1000) {
    await new Promise(resolve => setTimeout(() => resolve(), ms))
  }
}