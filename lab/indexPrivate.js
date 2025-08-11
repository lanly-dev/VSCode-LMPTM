const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--incognito'] })
  // Create an incognito context
  const context1 = await browser.newContext() // This is NOT incognito, just a new context
  const page1 = await context1.newPage()
  await page1.goto('https://www.youtube.com', { waitUntil: 'networkidle' })

  // Create another context (like a separate window)
  const context2 = await browser.newContext()
  const page2 = await context2.newPage()
  await page2.goto('https://www.google.com', { waitUntil: 'networkidle' })

  // ...existing code...
  // await browser.close()
})()
