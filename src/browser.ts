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
      pages.forEach(page => page.on('load', () => this.setupPageWatcher(page)))
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

    page.addStyleTag({ path: Browser.cssPath })
    page.addScriptTag({ path: Browser.jsPath })
    this.newTabFixed(page)

    page.on('close', async () => {
      await new Promise(resolve => setTimeout(() => resolve(), 1000))
      if (Browser.activeBrowser) this.update('page_closed', page.target())
    })

    page.exposeFunction('pageSelected', _e => {
      this.update('pageSelected', page.target())
    })
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


  // private setupPage(page: puppeteer.Page) {
  //   // @ts-ignore
  //   if (!page._pageBindings.has('onPlayClick')) {
  //     page.exposeFunction('onPlayClick', _e => {
  //       this.update('click', page.target())
  //     })
  //   }

  //   page.evaluate((type) => {
  //     // @ts-ignore
  //     document.addEventListener(type, e => {
  //       // @ts-ignore
  //       window.onPlayClick({ type })
  //     })
  //   }, 'click')

  //   const cssPath = path.join(this.context.extensionPath, 'out', 'resrc', 'style.css')
  //   const uiHtmlPath = fs.readFileSync(path.join(this.context.extensionPath, 'out', 'resrc', 'ui.html'), 'utf8')
  //   page.addStyleTag({ path: cssPath })
  //   // page.addStyleTag({content: '#columns {background: red !important;}'})

  //   // @ts-ignore
  //   page.evaluateOnNewDocument(uiHtmlPath => {
  //     const div = document.createElement('div')
  //     div.innerHTML = uiHtmlPath
  //     console.log('asdfasdfasdfadsfa')
  //     document.getElementsByTagName('body')[0].appendChild(div)
  //   }, uiHtmlPath)

  //   page.on('close', async () => {
  //     await new Promise(resolve => setTimeout(() => resolve(), 1000))
  //     if (Browser.activeBrowser) this.update('page_closed', page.target())
  //   })
  // }

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
    this.selectedPage = await this.updatePages()
    const pStatus = await this.getPlayingStatus(this.selectedPage)
    if (pStatus.brand !== 'other') {
      this.selectedMusicPageBrand = pStatus.brand
      this.buttons.setPlayButton(pStatus.status)
    }
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
      if (this.selectedPage === page) this.closeEventUpdate()
      else this.updatePages()
    }
    else if (event === 'page_created') {
      if (page) page.on('load', () => this.setupPageWatcher(page))
    }
    else if (event === 'page_changed' || event === 'click') {
      this.changeEventCheck(page)
    }
  }
}
