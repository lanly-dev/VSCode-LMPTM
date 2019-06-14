import * as puppeteer from 'puppeteer-core'

// @ts-ignore
import * as whichChrome from 'which-chrome'

export class Browser {
  private currentPagePlaying: puppeteer.Page | undefined
  constructor() {
    this.launch()
  }

  launch() {
    const chromePath = whichChrome.Chrome || whichChrome.Chromium
    puppeteer
      .launch({
        executablePath: chromePath,
        headless: false
      })
      .then(async browser => {
        const [page] = await browser.pages()
        await page.goto('https://youtube.com/')
        this.currentPagePlaying = page
      })
  }
  playPause() {
    if (this.currentPagePlaying) this.currentPagePlaying.keyboard.press('k')
  }
  async skip() {
    if (this.currentPagePlaying) {
      this.currentPagePlaying.click('.ytp-next-button')
    }
  }
  back() {
    if (this.currentPagePlaying) this.currentPagePlaying.goBack()
  }
}
