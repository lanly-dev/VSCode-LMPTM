import { Page as PuppeteerPage } from 'puppeteer-core'
import { Page as PlaywrightPage } from 'playwright-core'
export interface Entry {
  brand: string
  id?: string // for Playwright
  index: number
  picked: boolean
  pptPage?: PuppeteerPage
  pwrPage?: PlaywrightPage
  state: MediaSessionPlaybackState
  title: string
}
