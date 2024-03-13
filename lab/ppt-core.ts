import WhichChrome from './whichChrome'
import puppeteer from 'puppeteer-core'

;(async () => {
  // set some options (set headless to false so we can see
  // this automated browsing experience)
  const executablePath = WhichChrome.getPaths().Chrome ?? WhichChrome.getPaths().Chromium
  const launchOptions = {
    headless: false,
    executablePath, // because we are using puppeteer-core so we must define this option
    args: ['--start-maximized']
  }

  const browser = await puppeteer.launch(launchOptions)
  const page = await browser.newPage()

  // set viewport and user agent (just in case for nice viewing)
  await page.setViewport({ width: 1366, height: 768 })
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
  )

  // go to the target web
  await page.goto('https://google.com')

  console.log(await browser.version())

  // close the browser
  // await browser.close()
})()
