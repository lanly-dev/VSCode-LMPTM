import { Page } from 'puppeteer-core'
export interface Entry {
  brand: string
  index: number
  page: Page
  picked: boolean
  state: 'playing' | 'paused' | 'none'
  title: string
}
