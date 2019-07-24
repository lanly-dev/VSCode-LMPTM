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
  private currentBrowser: puppeteer.Browser
  private pages: puppeteer.Page[]
  private currentPage: puppeteer.Page
  private currentMusicPageBrand: String | undefined
  private buttons: Buttons
  private context: vscode.ExtensionContext

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
        Browser.activeBrowser = new Browser(browser, await browser.pages(), buttons, context)
      })
    }
  }

  constructor(browser: puppeteer.Browser, pages: puppeteer.Page[], buttons: Buttons, context: vscode.ExtensionContext) {
    this.buttons = buttons
    this.context = context
    this.currentBrowser = browser
    this.currentPage = pages[0]
    this.pages = pages
    this.currentPage.goto('https://youtube.com/')
    const waitABit = new Promise(resolve => setTimeout(() => resolve(), 3000))
    waitABit.then(() => {
      this.currentBrowser.on('targetcreated', target => this.update('page_created', target))
      this.currentBrowser.on('targetchanged', target => this.update('page_changed', target))
      // this.currentBrowser.on('targetdestroyed', target => this.update('page_destroyed',target))
      this.currentBrowser.on('disconnected', () => {
        this.buttons.setStatusButtonText('Launch')
        Browser.activeBrowser = undefined
      })
      pages.forEach(page => this.setupPage(page))
      pages.forEach(page => page.on('load', () => this.setupPage(page)))
    })
  }

  play() {
    if (this.currentPage) this.currentPage.keyboard.press('k')
    this.buttons.setPlayButton('pause')
  }

  pause() {
    if (this.currentPage) this.currentPage.keyboard.press('k')
    this.buttons.setPlayButton('play')
  }

  skip() {
    if (this.currentPage) this.currentPage.click('.ytp-next-button')
  }

  back() {
    if (this.currentPage) this.currentPage.goBack()
  }

  private setupPage(page: puppeteer.Page) {
    // @ts-ignore
    if (!page._pageBindings.has('onPlayClick')) {
      page.exposeFunction('onPlayClick', _e => {
        this.update('click', page.target())
      })
    }

    page.evaluate((type) => {
      // @ts-ignore
      document.addEventListener(type, e => {
        // @ts-ignore
        window.onPlayClick({ type })
      })
    }, 'click')

    const cssPath = path.join(this.context.extensionPath, 'out', 'resrc', 'style.css')
    const uiHtml = fs.readFileSync(path.join(this.context.extensionPath, 'out', 'resrc', 'ui.html'), 'utf8')
    page.addStyleTag({ path: cssPath })
    // page.addStyleTag({content: '#columns {background: red !important;}'})

    // @ts-ignore
    page.evaluateOnNewDocument(uiHtml => {
      window.onload = () => {
        const div = document.createElement('div')
        div.innerHTML = uiHtml
        document.getElementsByTagName('body')[0].appendChild(div)
      }
    }, uiHtml)

    page.on('close', async () => {
      await new Promise(resolve => setTimeout(() => resolve(), 1000))
      if (Browser.activeBrowser) this.update('page_closed', page.target())
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
      if (this.currentPage === page) {
        this.currentMusicPageBrand = pStatus.brand
        this.buttons.setPlayButton(pStatus.status)
      }
      else {
        if (pStatus.status === 'play') {
          this.pause()
          this.currentMusicPageBrand = pStatus.brand
          this.buttons.setPlayButton(pStatus.status)
        }
      }
    }
  }

  private async closeEventUpdate() {
    this.buttons.setPlayButton('pause')
    this.currentPage = await this.updatePages()
    const pStatus = await this.getPlayingStatus(this.currentPage)
    if (pStatus.brand !== 'other') {
      this.currentMusicPageBrand = pStatus.brand
      this.buttons.setPlayButton(pStatus.status)
    }
  }

  private async getPlayingStatus(page: puppeteer.Page) {
    await new Promise(resolve => setTimeout(() => resolve(), 100))
    const pageBrand = this.musicPageCheck(page.url())
    if (pageBrand === 'youtube') {
      const element = await this.currentPage.$('.ytp-play-button')
      const text = await this.currentPage.evaluate(element =>
        { console.log(element.getAttribute('aria-label'))
          return element.getAttribute('aria-label')}, element)
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
    console.log(event)
    const page = await target.page()
    if (event === 'page_closed') {
      if (this.currentPage === page) this.closeEventUpdate()
      else this.updatePages()
    }
    else if (event === 'page_created') {
      if (page) page.on('load', () => this.setupPage(page))
    }
    else if (event === 'page_changed' || event === 'click') {
      this.changeEventCheck(page)
    }
  }
}
