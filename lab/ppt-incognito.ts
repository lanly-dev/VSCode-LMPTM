import WhichChrome from './whichChrome'
import puppeteer, { Browser } from 'puppeteer'

puppeteer
  .launch({
    executablePath: WhichChrome.getPaths().Chrome ?? WhichChrome.getPaths().Chromium,
    headless: false,
    ignoreHTTPSErrors: false,
    args: ['--incognito', '--no-sandbox']
  })
  .then(async browser => {
    method(browser)
  })

async function method(browser: Browser) {
  // const newPage = await browser.newPage()
  // newPage.goto('https://www.messenger.com')

  const curContext = await browser.browserContexts()[0]
  const curPage = await curContext.newPage()
  curPage.goto('https://www.yahoo.com')

  const dContext = await browser.defaultBrowserContext()
  const page = await dContext.newPage()
  page.goto('https://www.google.com')

  const context = await browser.createBrowserContext()
  const page1 = await context.newPage()
  await page1.goto('https://example.com')
}
