import { Page as PuppeteerPage } from 'puppeteer-core'
import { Page as PlaywrightPage } from 'playwright-core'
export interface Entry {
  brand: string
  index: number
  pptPage?: PuppeteerPage
  pwrPage?: PlaywrightPage
  picked: boolean
  state: MediaSessionPlaybackState
  title: string
}
