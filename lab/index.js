const puppeteer = require('puppeteer')

;(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 }
    })
    const page = await browser.newPage()
    await page.goto('https://www.youtube.com', { waitUntil: 'networkidle0' })
    // Keep the browser open
    // await browser.close()
  } catch (error) {
    console.error('Error:', error)
  }
})()
