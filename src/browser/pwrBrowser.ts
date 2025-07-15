import * as playwright from 'playwright-core'
import * as vscode from 'vscode'

import { Entry } from '../interfaces'
import Browser from './browser'
import Lmptm from '../lmptm'
import Buttons from '../buttons'
import TreeviewProvider from '../treeview'

export default class PwrBrowser extends Browser {
  private buttons: Buttons
  private currentBrowser: playwright.Browser
  private context: playwright.BrowserContext
  private pagesStatus: Entry[]
  private selectedMusicBrand: string | undefined
  private selectedPage: playwright.Page | undefined

  constructor(browser: playwright.Browser, buttons: Buttons, context: playwright.BrowserContext) {
    super()
    this.buttons = buttons
    this.currentBrowser = browser
    this.pagesStatus = []
    this.context = context
    this.context.on('page', (page: playwright.Page) => this.update('page_created', page))
    this.context.addInitScript({ path: Lmptm.jsPath })
    this.context.exposeFunction('pageSelected', (page: playwright.Page) => this.update('page_selected:button', page))
    this.context.exposeFunction('playbackChanged', (page: playwright.Page, state: string) => this.update(`playback_changed:${state}`, page))
    this.currentBrowser.on('disconnected', () => {
      // Either closed by script or crash, not manually
      this.buttons.setStatusButtonText('Launch $(rocket)')
      Lmptm.activeBrowser = undefined
      this.buttons.displayPlayback(false)
      TreeviewProvider.refresh()
      vscode.commands.executeCommand('setContext', 'lmptm.launched', false)
      Lmptm.launched = false
    })
    this.launchPages()
  }

  async playPause() {
    if (!this.selectedPage) return
    const { state } = await this.getPlaybackState(this.selectedPage)
    switch (this.selectedMusicBrand) {
      case 'soundcloud': case 'spotify': case 'ytmusic':
        await this.selectedPage.keyboard.press('Space')
        break
      case 'youtube':
        await this.selectedPage.keyboard.press('k')
    }
    this.buttons.setPlayButtonLabel(state)
  }

  async skip() {
    if (!this.selectedPage) return
    switch (this.selectedMusicBrand) {
      case 'soundcloud':
        await this.selectedPage.keyboard.down('Shift')
        await this.selectedPage.keyboard.press('ArrowRight')
        await this.selectedPage.keyboard.up('Shift')
        break
      case 'spotify':
        await this.selectedPage.keyboard.down('Control')
        await this.selectedPage.keyboard.press('ArrowRight')
        await this.selectedPage.keyboard.up('Control')
        break
      case 'youtube':
        await this.selectedPage.keyboard.down('Shift')
        await this.selectedPage.keyboard.press('n')
        await this.selectedPage.keyboard.up('Shift')
        break
      case 'ytmusic':
        await this.selectedPage.keyboard.press('j')
    }
  }

  async back() {
    if (!this.selectedPage) return
    switch (this.selectedMusicBrand) {
      case 'soundcloud':
        await this.selectedPage.keyboard.down('Shift')
        await this.selectedPage.keyboard.press('ArrowLeft')
        await this.selectedPage.keyboard.up('Shift')
        break
      case 'spotify':
        await this.selectedPage.keyboard.down('Control')
        await this.selectedPage.keyboard.press('ArrowLeft')
        await this.selectedPage.keyboard.up('Control')
        break
      case 'youtube':
        await this.selectedPage.goBack()
        break
      case 'ytmusic':
        await this.selectedPage.keyboard.press('j')
    }
  }

  async forward() {
    if (!this.selectedPage) return
    switch (this.selectedMusicBrand) {
      case 'youtube':
        await this.selectedPage.keyboard.press('ArrowRight')
        break
      default: vscode.window.showInformationMessage(Lmptm.SEEK_MSG)
    }
  }

  async backward() {
    if (!this.selectedPage) return
    switch (this.selectedMusicBrand) {
      case 'youtube':
        await this.selectedPage.keyboard.press('ArrowLeft')
        break
      default: vscode.window.showInformationMessage(Lmptm.SEEK_MSG)
    }
  }

  closeBrowser() {
    this.currentBrowser.close()
  }

  closeTab(tab: Entry) {
    tab.pwrPage!.close()
  }

  getTabTitle() {
    if (!this.selectedPage) return Promise.resolve(undefined)
    return this.selectedPage.title()
  }

  getPagesStatus() {
    return this.pagesStatus
  }

  async pickTab(index: number) {
    if (!this.pagesStatus) return
    await this.tabOrderUpdate()
    const { pwrPage: page, state } = this.pagesStatus[index]
    if (state === 'none') {
      vscode.window.showInformationMessage(Lmptm.STATE_MSG)
      return
    }
    this.update('page_selected:tab', page!)
  }

  // ↓↓↓↓ Private methods ↓↓↓↓

  private async launchPages() {
    const links: string[] | undefined = vscode.workspace.getConfiguration().get('lmptm.startPages')
    if (links && links.length) {
      for (const e of links) {
        const pg = await this.newPage()
        await pg.goto(e)
      }
    }
    TreeviewProvider.refresh()
  }

  private async newPage() {
    return this.context.newPage()
  }

  private resetFloatButton() {
    this.selectedPage?.evaluate(() => (window as any).reset && (window as any).reset())
  }

  private clickFloatButton(thePage: playwright.Page) {
    thePage.evaluate(() => (window as any).click && (window as any).click())
  }

  private async tabOrderUpdate() {
    const pages = this.context.pages()
    const newPagesStatus = []
    for (const [i, p] of pages.entries()) {
      for (const e of this.pagesStatus) {
        if (p !== e.pwrPage) continue
        e.index = i
        newPagesStatus.push(e)
      }
    }
    this.pagesStatus = newPagesStatus
    TreeviewProvider.refresh()
  }

  private getPlaybackState(page: playwright.Page) {
    for (const e of this.pagesStatus)
      if (e.pwrPage === page) return e
    return this._getPlaybackState(page)
  }

  private async _getPlaybackState(page: playwright.Page) {
    const pageBrand = this.musicBrandCheck(page.url())
    const state = await page.evaluate(() => (navigator as any).mediaSession.playbackState)
    return { brand: pageBrand, state }
  }

  private musicBrandCheck(url: string) {
    if (url.includes('soundcloud.com')) return 'soundcloud'
    else if (url.includes('open.spotify.com')) return 'spotify'
    else if (url.includes('www.youtube.com/watch')) return 'youtube'
    else if (url.includes('music.youtube.com')) return 'ytmusic'
    else return 'other'
  }

  private async update(event: string, page: playwright.Page | null) {
    console.debug('$$$$$$$$$', event)
    if (!page) return

    let extra
    if (event.includes('page_selected')) {
      [event, extra] = event.split(':')
      if (!extra) throw new Error('page_selected event needs source - tab|button')
    }
    else if (event.includes('playback_change')) {
      [event, extra] = event.split(':')
      if (!extra) throw new Error('playback_change event needs state - playing|paused|none')
    }

    switch (event) {
      case 'page_changed': await this.pageChanged(page); break
      case 'page_closed': this.pageClosed(page); break
      case 'page_created': await this.pageCreated(page); break
      case 'page_selected': await this.pageSelected(page, <string>extra); break
      case 'playback_changed': await this.playbackChanged(page, <string>extra); break
      default: vscode.window.showErrorMessage(`Unknown event - ${event}`)
    }
    TreeviewProvider.refresh()
  }

  private async pageChanged(page: playwright.Page) {
    const pageURL = page.url()
    const brand = this.musicBrandCheck(pageURL)
    // await this.bypassCSP(brand, page)

    const title = await page.title()
    for (const [i, e] of this.pagesStatus.entries()) {
      if (e.pwrPage !== page) continue
      if (this.selectedPage === page) this.selectedMusicBrand = brand
      if (brand === 'other') {
        this.pagesStatus[i].picked = false
        this.pagesStatus[i].state = 'none'
        this.closingHelper()
      }
      this.pagesStatus[i].brand = brand
      this.pagesStatus[i].title = title
    }
  }

  private pageClosed(page: playwright.Page) {
    if (page === this.selectedPage) this.closingHelper()
    this.pagesStatus.forEach((e, i, arr) => {
      if (e.pwrPage !== page) return
      arr.splice(i, 1)
    })
    console.log(this.currentBrowser.isConnected())
    console.log(this.currentBrowser.contexts().length)
    console.log(this.context.pages().length)
  }

  private closingHelper() {
    this.buttons.displayPlayback(false)
    this.buttons.setStatusButtonText('Running $(browser)')
    this.selectedPage = undefined
    this.selectedMusicBrand = undefined
  }

  private async pageCreated(page: playwright.Page) {
    console.log('PAGE CREATED')
    const pageURL = page.url()
    const brand = pageURL === 'about:blank' ? 'other' : this.musicBrandCheck(pageURL)
    // await this.bypassCSP(brand, page)

    let title = pageURL === 'about:blank' ? pageURL : await page.title()
    if (title === '') title = 'New Tab'

    const pages = await this.context.pages()
    for (const [index, p] of pages.entries()) {
      if (p !== page) continue
      this.pagesStatus.splice(index, 0, { pwrPage: p, brand, index, state: 'none', picked: false, title })
    }

    page.once('load', async () => {
      await page.mainFrame().addStyleTag({ path: Lmptm.cssPath })
      await page.mainFrame().addScriptTag({ path: Lmptm.jsPath })
    })

    page.on('close', async () => {
      // Not manually closed, but by script or crash
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))
      if (Lmptm.activeBrowser) this.update('page_closed', page)
    })
  }

  private async pageSelected(page: playwright.Page, source: string) {
    this.buttons.displayPlayback(true)

    if (this.selectedPage) {
      const { state } = await this.getPlaybackState(this.selectedPage)
      if (this.selectedPage === page) {
        await this.playPause()
        return
      } else {
        this.pagesStatus.forEach(e => e.pwrPage === this.selectedPage ? e.picked = false : null)
        if (source === 'button' && state === 'playing') await this.playPause()
        this.resetFloatButton()
      }
    }

    for (const [i, e] of this.pagesStatus.entries()) {
      if (e.pwrPage !== page) continue
      if (source === 'tab') {
        this.clickFloatButton(e.pwrPage)
        break
      } else {
        this.selectedPage = e.pwrPage
        this.pagesStatus[i].picked = true
        this.selectedMusicBrand = this.musicBrandCheck(page.url())
        const title = await this.selectedPage.title()
        this.pagesStatus[i].title = title
        this.buttons.setStatusButtonText(title)
      }
    }
  }

  private async playbackChanged(page: playwright.Page, state: string) {
    for (const [i, e] of this.pagesStatus.entries()) {
      if (e.pwrPage !== page) continue
      if (this.selectedPage === page) {
        this.buttons.setPlayButtonLabel(state as MediaSessionPlaybackState)
        this.buttons.setStatusButtonText(await this.selectedPage.title())
      }
      this.pagesStatus[i].state = state as MediaSessionPlaybackState
      this.pagesStatus[i].title = await page.title()
    }
  }

  // private async bypassCSP(brand: string, page: playwright.Page) {
  //   // Playwright does not have setBypassCSP, but you can set it in context options if needed
  //   // For now, just a placeholder for parity with Puppeteer logic
  //   // You may need to adjust this for your use case
  // }
}
