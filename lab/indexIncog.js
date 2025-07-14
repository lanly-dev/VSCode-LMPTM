const puppeteer = require('puppeteer')

;(async () => {
  const browser = await puppeteer.launch({ headless: false, args: ['--incognito'] })
  // const page = await browser.defaultBrowserContext().newPage()
  console.log(await browser.pages())
  const page = (await browser.pages())[0]
  await page.goto('https://www.youtube.com', { waitUntil: 'networkidle0' })
  // const page2 = await page.browserContext().newPage()
  // const page3 = await page.browserContext().newPage()
  // console.log(await page.browserContext().pages())
  // const pages = await browser.pages()
  // pages.forEach(async p => {
  //   console.log(await p.browser())
  // })
  // browser.close()
  // const page1 = await context.newPage()
  // await page1.goto('https://example.com')
})()
