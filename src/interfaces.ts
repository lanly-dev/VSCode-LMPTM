import { Page } from 'puppeteer-core'
export interface Entry {
  brand: string
  index: number
  page: Page
  picked: boolean
  state: MediaSessionPlaybackState
  title: string
}
