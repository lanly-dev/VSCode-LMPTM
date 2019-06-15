import * as puppeteer from 'puppeteer-core'
import { URL } from 'url'

// @ts-ignore
import * as whichChrome from 'which-chrome'
import { Buttons } from './buttons'

export class Browser {

  public static activeBrowser: Browser | undefined
  private currentBrowser: puppeteer.Browser
  private currentPage: puppeteer.Page
  private buttons: Buttons
  private pages: puppeteer.Page[]

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
    // this.pageListening = []
    this.currentBrowser.on('targetcreated', () => this.update('created'))
    // this.currentBrowser.on('targetchanged', () => this.update('changed'))
    // this.currentBrowser.on('targetdestroyed', () => this.update('destroyed'))
    this.currentBrowser.on('disconnected', () => this.update('disconnected'))
    this.attachedHandlers(pages)
  }

  attachedHandlers(pages: puppeteer.Page[]) {
    for (const page of pages) {
      if (page) {
        page.on('domcontentloaded', () => {
          const name = new URL(page.url()).host.match(/\.(.*?)\./)
          if (name)
            this.attachedClickListener(name[1], page)
        })
        page.on('close', target => this.update('pageclosed'))
      }
    }
  }

  attachedClickListener(hostname: string, page: puppeteer.Page) {
    switch (hostname) {
      case 'youtube': {
        this.youtubeClickListener(page)
      }
    }
  }

  youtubeClickListener(page: puppeteer.Page) {
    // @ts-ignore
    if (!page._pageBindings.has('onPlayClick')) {
      page.exposeFunction('onPlayClick', e => {
        const signal = e.isPlaying ? 'pauseclicked' : 'playclicked'
        this.update(signal)
      })
    }

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

  playPause() {
    if (this.currentPage) this.currentPage.keyboard.press('k')
  }

  skip() {
    if (this.currentPage) {
      this.currentPage.click('.ytp-next-button')
    }
  }

  back() {
    if (this.currentPage) this.currentPage.goBack()
  }

  update(event: string) {
    if (event === 'disconnected') {
      this.buttons.setStatusButtonText('Launch')
      Browser.activeBrowser = undefined
    }
    else if (event === 'pageclosed') {
      console.log('page closed')
    }
    else if (event === 'playclicked') {
      console.log('play')
    }
    else if (event === 'pauseclicked') {
      console.log('pause')
    }
  }
}
