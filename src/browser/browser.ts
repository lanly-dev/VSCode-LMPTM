import { Entry } from '../interfaces'

export default abstract class Browser {
  abstract playPause(): Promise<void>
  abstract skip(): Promise<void>
  abstract back(): Promise<void>
  abstract forward(): Promise<void>
  abstract backward(): Promise<void>
  abstract closeBrowser(): void
  abstract closeTab(tab: Entry): void
  abstract getTabTitle(): Promise<string | undefined>
  abstract getPagesStatus(): Entry[]
  abstract pickTab(index: number): Promise<void>
}
