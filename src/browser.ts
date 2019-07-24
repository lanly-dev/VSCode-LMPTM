import { URL } from 'url'
import * as puppeteer from 'puppeteer-core'
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs';

// @ts-ignore
import * as whichChrome from 'which-chrome'
import { Buttons } from './buttons'

export class Browser {

  public static activeBrowser: Browser | undefined
  public static cssPath: string
  public static jsPath: string
  public static uiHtmlPath: string
  public static faCssPath: string
  public static faJsPath: string
  private currentBrowser: puppeteer.Browser
  private pages: puppeteer.Page[]
  private selectedPage: puppeteer.Page | undefined
  private selectedMusicPageBrand: String | undefined
  private buttons: Buttons

  public static launch(buttons: Buttons, context: vscode.ExtensionContext) {
    const chromePath = whichChrome.Chrome || whichChrome.Chromium

    if (!Browser.activeBrowser) {
      puppeteer.launch({
        executablePath: chromePath,
        headless: false,
        defaultViewport: null,
        args: ['--incognito', '--window-size=500,500']
      }).then(async browser => {
        buttons.setStatusButtonText('running')
        Browser.cssPath = path.join(context.extensionPath, 'out', 'resrc', 'style.css')
        Browser.jsPath = path.join(context.extensionPath, 'out', 'resrc', 'script.js')
        Browser.faCssPath = path.join(context.extensionPath, 'node_modules', '@fortawesome', 'fontawesome-free', 'css', 'all.min.css')
        Browser.faJsPath = path.join(context.extensionPath, 'node_modules', '@fortawesome', 'fontawesome-free', 'js', 'all.min.js')
        Browser.uiHtmlPath = fs.readFileSync(path.join(context.extensionPath, 'out', 'resrc', 'ui.html'), 'utf8')
        Browser.activeBrowser = new Browser(browser, await browser.pages(), buttons)
      })
    }
  }

  constructor(browser: puppeteer.Browser, pages: puppeteer.Page[], buttons: Buttons) {
    this.buttons = buttons
    this.currentBrowser = browser
    this.pages = pages
    this.selectedPage = undefined
    pages[0].goto('https://youtube.com/')
    const waitABit = new Promise(resolve => setTimeout(() => resolve(), 3000))
    waitABit.then(() => {
      this.currentBrowser.on('targetcreated', target => this.update('page_created', target))
      this.currentBrowser.on('targetchanged', target => this.update('page_changed', target))
      // this.currentBrowser.on('targetdestroyed', target => this.update('page_destroyed',target))
      this.currentBrowser.on('disconnected', () => {
        this.buttons.setStatusButtonText('Launch')
        Browser.activeBrowser = undefined
      })
      pages.forEach(page => this.setupPageWatcher(page))
      // pages.forEach(page => page.on('load', () => this.setupPageWatcher(page)))
    })
  }

  play() {
    if (this.selectedPage) this.selectedPage.keyboard.press('k')
    this.buttons.setPlayButton('pause')
  }

  pause() {
    if (this.selectedPage) this.selectedPage.keyboard.press('k')
    this.buttons.setPlayButton('play')
  }

  skip() {
    if (this.selectedPage) this.selectedPage.click('.ytp-next-button')
  }

  back() {
    if (this.selectedPage) this.selectedPage.goBack()
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

    page.addScriptTag({url: 'https://code.jquery.com/jquery-3.4.1.min.js'})
    page.addStyleTag({ path: Browser.cssPath })
    page.addScriptTag({ path: Browser.jsPath })
    page.addStyleTag({ path: Browser.faCssPath })
    page.addScriptTag({ path: Browser.faJsPath })
    this.newTabFixed(page)

    page.on('close', async () => {
      await new Promise(resolve => setTimeout(() => resolve(), 1000))
      if (Browser.activeBrowser) this.update('page_closed', page.target())
    })

    // @ts-ignore
    if (!page._pageBindings.has('pageSelected')) {
      page.exposeFunction('pageSelected', e => {
        this.update('pageSelected', page.target())
        if (page !== this.selectedPage) {
          this.selectedPage = page
          this.setupMusicPage()
        }
        if (e.brand !== this.selectedMusicPageBrand) {
          this.selectedMusicPageBrand = e.brand
        }
      })
    }
  }

  private newTabFixed(page: puppeteer.Page) {
    //https://github.com/GoogleChrome/puppeteer/issues/3667
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

  private setupMusicPage() {
    const page = this.selectedPage
    if (!page) return
    // @ts-ignore
    if (!page._pageBindings.has('onUserClick')) {
      page.exposeFunction('onUserClick', _e => {
        this.update('click', page.target())
      })
    }

    page.evaluate((type) => {
      // @ts-ignore
      document.addEventListener(type, e => {
        // @ts-ignore
        window.onUserClick({ type })
      })
    }, 'click')

    page.on('close', async () => {
      await new Promise(resolve => setTimeout(() => resolve(), 1000))
      if (Browser.activeBrowser) this.update('music_page_closed', page.target())
    })
  }

  private async updatePages() {
    this.pages = await this.currentBrowser.pages()
    return this.pages[0]
  }

  private async changeEventCheck(page: puppeteer.Page) {
    const pStatus = await this.getPlayingStatus(page)
    console.log(pStatus.brand, pStatus.status)
    if (pStatus.brand !== 'other') {
      if (this.selectedPage === page) {
        this.selectedMusicPageBrand = pStatus.brand
        this.buttons.setPlayButton(pStatus.status)
      }
      else {
        if (pStatus.status === 'play') {
          this.pause()
          this.selectedMusicPageBrand = pStatus.brand
          this.buttons.setPlayButton(pStatus.status)
        }
      }
    }
  }

  private async closeEventUpdate() {
    this.buttons.setPlayButton('pause')
    this.selectedPage = undefined
  }

  private async getPlayingStatus(page: puppeteer.Page) {
    await new Promise(resolve => setTimeout(() => resolve(), 100))
    const pageBrand = this.musicPageCheck(page.url())
    if (pageBrand === 'youtube' && this.selectedPage) {
      const element = await this.selectedPage.$('.ytp-play-button')
      const text = await this.selectedPage.evaluate(element => {
        console.log(element.getAttribute('aria-label'))
        return element.getAttribute('aria-label')
      }, element)
      const stt = text.includes('Play') ? 'play' : 'pause'
      return { brand: pageBrand, status: stt }
    }
    return { brand: pageBrand, status: '' }
  }

  private musicPageCheck(url: string) {
    if (url.includes('youtube.com/watch')) return 'youtube'
    else return 'other'
  }

  private async update(event: string, target: puppeteer.Target) {
    const page = await target.page()
    if (event === 'page_closed') {
      this.updatePages()
    }
    if (event === 'music_page_closed') {
      this.closeEventUpdate()
    }
    else if (event === 'page_created') {
      if (page) page.on('load', () => this.setupPageWatcher(page))
    }
    else if (event === 'page_changed' || event === 'click') {
      this.changeEventCheck(page)
    }
  }
}
