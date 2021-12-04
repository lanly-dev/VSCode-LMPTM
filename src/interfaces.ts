import { Page } from 'puppeteer-core'
export interface Entry {
  page: Page
  brand: string
  index: number
  picked: false
  state: 'playing' | 'paused' | 'none'
  title: string
}
