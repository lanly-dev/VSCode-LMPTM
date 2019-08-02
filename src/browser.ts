import * as puppeteer from 'puppeteer-core'
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs';

// @ts-ignore
import * as whichChrome from 'which-chrome'
import { Buttons } from './buttons'

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
    spotify: '.spoticon-play-16',
    youtube: '.ytp-play-button'
  }
  private currentBrowser: puppeteer.Browser
  private pages: puppeteer.Page[] | undefined
  private selectedPage: puppeteer.Page | undefined
  private selectedMusicPageBrand: String | undefined
  private buttons: Buttons

  public static launch(buttons: Buttons, context: vscode.ExtensionContext) {
    const chromePath = whichChrome.Chrome || whichChrome.Chromium
    console.log(Browser.launched)
    if (!Browser.activeBrowser && !Browser.launched) {
      Browser.launched = true
      puppeteer.launch({
        executablePath: chromePath,
        headless: false,
        defaultViewport: null,
        args: ['--incognito', '--window-size=500,500'],
        ignoreDefaultArgs: ['--mute-audio', '--hide-scrollbars']
      }).then(async browser => {
        buttons.setStatusButtonText('Running 🎵')
        Browser.cssPath = path.join(context.extensionPath, 'out', 'resrc', 'style.css')
        Browser.jsPath = path.join(context.extensionPath, 'out', 'resrc', 'script.js')
        Browser.faCssPath = path.join(context.extensionPath, 'node_modules', '@fortawesome', 'fontawesome-free', 'css', 'all.min.css')
        Browser.faJsPath = path.join(context.extensionPath, 'node_modules', '@fortawesome', 'fontawesome-free', 'js', 'all.min.js')
        Browser.uiHtmlPath = fs.readFileSync(path.join(context.extensionPath, 'out', 'resrc', 'ui.html'), 'utf8')
        const defaultPages = await browser.pages()
        defaultPages[0].close() // evaluateOnNewDocument won't on this page
        Browser.activeBrowser = new Browser(browser, buttons)
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
      this.buttons.setStatusButtonText('Launch 🚀')
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
    this.injectCode(page1)
    this.injectCode(page2)
    this.injectCode(page3)
    this.pages = await this.currentBrowser.pages()
  }

  // The button doesn't show up on the 1st launch
  private injectCode(page: puppeteer.Page) {
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

    page.addStyleTag({ path: Browser.cssPath })
    page.addScriptTag({ path: Browser.jsPath })
    page.addStyleTag({ path: Browser.faCssPath })
    page.addScriptTag({ path: Browser.faJsPath })

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
          this.setupMusicPage()
          this.buttons.dipslayPlayback(true)
          this.buttons.setStatusButtonText(await this.selectedPage.title())
        }
        if (e.brand !== this.selectedMusicPageBrand) {
          this.selectedMusicPageBrand = e.brand
        }
      })
    }
  }

  private setupMusicPage() {
    const page = this.selectedPage
    if (!page) return
    const brand = this.musicBrandCheck(page.url())
    if (brand === 'other') return

    page.exposeFunction('onPlayingChangeEvent', () => {
      this.update('play_event', page.target())
    })

    page.evaluate(playButtonCss => {
      const target = document.querySelector(playButtonCss)
      const observer = new MutationObserver(() => {
        // @ts-ignore
        onPlayingChangeEvent()
      })
      // @ts-ignore
      observer.observe(target, { attributes: true })
    }, Browser.playButtonCss[brand])

    page.on('close', async () => {
      await this.sleep()
      if (Browser.activeBrowser) this.update('music_page_closed', page.target())
    })
  }

  private async updatePages() {
    this.pages = await this.currentBrowser.pages()
    return this.pages[0]
  }

  private resetButton() {
    // @ts-ignore
    this.selectedPage.evaluate(() => reset())
  }

  private async changeEventCheck(page?: puppeteer.Page) {
    if (!this.selectedPage) return
    if (page && page !== this.selectedPage) return
    const pStatus = await this.getPlayingStatus(this.selectedPage)
    if (pStatus.brand !== 'other') {
      this.selectedMusicPageBrand = pStatus.brand
      this.buttons.setPlayButton(pStatus.status)
      this.buttons.setStatusButtonText(await this.selectedPage.title())
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
      // console.log('page_create', this.musicBrandCheck(page.url()))
      page.setBypassCSP(true)
      // if (this.musicBrandCheck(page.url()) === 'spotify') {
      //   page.setBypassCSP(true)
      //   page.goto('https://open.spotify.com')
      //   page.evaluate(() => sessionStorage.setItem('bypassCSP', 'yes'))
      // }
      if ((this.musicBrandCheck(page.url()) === 'spotify')) {
        page.goto(page.url())
      }

      page.on('load', () => {
        this.injectCode(page)
        this.setupPageWatcher(page)
      })
    }

    else if (event === 'page_changed') {
      // console.log('page_change', this.musicBrandCheck(page.url()))
      // console.log('page_change', page.url())
      if (this.musicBrandCheck(page.url()) === 'spotify') await this.disableCSP(page)
      else if (page === this.selectedPage) {
        page.setBypassCSP(false)
        // await page.evaluate(() => sessionStorage.setItem('bypassCSP', 'no'))
      }
      this.changeEventCheck(page)
    }

    else if (event === 'play_event') this.changeEventCheck(page)
    else if (event === 'music_page_closed') { }
  }

  private async disableCSP(page: puppeteer.Page) {
    const cspFlag = await page.evaluate(() => sessionStorage.getItem('bypassCSP'))
    if (cspFlag) return
    page.setBypassCSP(true)
    // await page.evaluate(() => sessionStorage.setItem('bypassCSP', 'yes'))
    await this.sleep()
    page.reload()
  }

  private async sleep(ms: number = 1000) {
    await new Promise(resolve => setTimeout(() => resolve(), ms))
  }
}