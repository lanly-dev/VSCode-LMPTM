
import puppeteer from 'puppeteer-extra'
import { setTimeout } from 'node:timers/promises'
import WhichChrome from './whichChrome'

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

// That's it, the rest is puppeteer usage as normal 😊
puppeteer.launch({
  executablePath: WhichChrome.getPaths().Chrome ?? WhichChrome.getPaths().Chromium,
  headless: false,
  ignoreHTTPSErrors: false,
  args: ['--incognito', '--no-sandbox']
// eslint-disable-next-line @typescript-eslint/no-unused-vars
}).then(async browser => {
  // method1(browser)
  // method2(browser)
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function method1(browser) {
  const page = await browser.newPage()
  await page.setViewport({ width: 800, height: 600 })

  console.log(`Testing adblocker plugin..`)
  await page.goto('https://www.vanityfair.com')
  await setTimeout(1000)
  await page.screenshot({ path: 'adblocker.png', fullPage: true })

  console.log(`Testing the stealth plugin..`)
  await page.goto('https://bot.sannysoft.com')
  await setTimeout(1000)
  await page.screenshot({ path: 'stealth.png', fullPage: true })

  console.log(`All done, check the screenshots. ✨`)
  await browser.close()
}

