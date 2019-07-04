import * as puppeteer from 'puppeteer-core'
import { URL } from 'url'

// @ts-ignore
import * as whichChrome from 'which-chrome'
import { Buttons } from './buttons'

export class Browser {

  public static activeBrowser: Browser | undefined
  private currentBrowser: puppeteer.Browser
  private pages: puppeteer.Page[]
  private currentPage: puppeteer.Page
  private currentPlayingType: String | undefined
  private buttons: Buttons

  public static launch(buttons: Buttons) {
    const chromePath = whichChrome.Chrome || whichChrome.Chromium

    if (!Browser.activeBrowser) {
      puppeteer.launch({
        executablePath: chromePath,
        headless: false,
        args: ['--incognito']
      }).then(async browser => {
        buttons.setStatusButtonText('running')
        Browser.activeBrowser = new Browser(browser, await browser.pages(), buttons)
      })
    }
  }

  constructor(browser: puppeteer.Browser, pages: puppeteer.Page[], buttons: Buttons) {
    this.currentBrowser = browser
    this.buttons = buttons
    this.pages = pages
    this.currentPage = pages[0]
    this.currentPage.goto('https://youtube.com/')
    this.currentBrowser.on('targetcreated', target => {console.log('wth'); this.update('page_created', target)})
    // this.currentBrowser.on('targetchanged', target => this.update('page_changed', target))
    // this.currentBrowser.on('targetdestroyed', target => this.update('destroyed',target))
    this.currentBrowser.on('disconnected', () => {
      this.buttons.setStatusButtonText('Launch')
      Browser.activeBrowser = undefined
    })
    pages.forEach(page => {
      page.on('load', () => this.checkPage(page))
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

  private checkPage(page: puppeteer.Page) {
    this.pageExposeFunc(page)
    let isMusicPage = false
    if (page.url().includes('youtube.com/watch')) {
      this.youtubeClickListener(page)
      isMusicPage = true
    }
    if (isMusicPage) page.on('close', target => this.update('page_closed', target))
  }

  private updateCurrentPage(page: puppeteer.Page, action: string) {
    if (action === 'closed') this.updatePages()
    else if (action === 'switched')
      this.currentPage = page
    this.checkPage(page)
  }

  private async updatePages() {
    this.pages = await this.currentBrowser.pages()
  }

  private async loadEventCheck() {
    const element = await this.currentPage.$('.ytp-play-button')
    const text = await this.currentPage.evaluate(element =>
      element.getAttribute('aria-label'), element)
    if (text.includes('Pause')) {
      this.buttons.setPlayButton('pause')
    }
  }

  private pageExposeFunc(page: puppeteer.Page) {
    // @ts-ignore
    if (!page._pageBindings.has('onPlayClick')) {
      page.exposeFunction('onPlayClick', e => {
        const signal = e.isPlaying ? 'pause_clicked' : 'play_clicked'
        this.update(signal, page.target())
      })
    }
  }

  private youtubeClickListener(page: puppeteer.Page) {
    page.evaluate((type, css) => {
      const element = document.querySelector(css)
      if (element)
        // @ts-ignore
        element.addEventListener(type, e => {
          // Can't get immediate reponse
          const waitAbit = new Promise(resolve => setTimeout(() => resolve(), 1))
          waitAbit.then(() => { // return after element updated
            const state = e.target.getAttribute('aria-label')
            // @ts-ignore
            window.onPlayClick({ type, isPlaying: state.includes('Play') })
          })
        })
    }, 'click', '.ytp-play-button')
  }

  private async checkPageOrder() {
    console.log('---------------------')

    let hello = await this.currentBrowser.pages()
    hello.forEach((page, index) => {
      console.log(page.url())
      console.log(index)
    })
    console.log('---------------------')
  }

  private async update(event: string, target: any) {

    const page = await target.page()
    if (event === 'page_closed') {
      if (page === this.currentPage)
        this.updateCurrentPage(page, 'closed')
      else
        this.updatePages()
    }
    else if (event === 'play_clicked') {
      if (page === this.currentPage)
        this.buttons.setPlayButton('pause')
      else {
        this.pause()
        this.updateCurrentPage(page, 'switched')
      }
    }
    else if (event === 'pause_clicked') {
      this.buttons.setPlayButton('play')
    }
    else if (event === 'page_created') {
      if (page) {
        page.on('load', () => this.checkPage(page))
      }
      else {
        this.loadEventCheck()
      }
    }
  }
}
