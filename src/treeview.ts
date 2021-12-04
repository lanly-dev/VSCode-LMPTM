import { Browser } from './browser'
import { Event, EventEmitter, ThemeIcon, TreeDataProvider, TreeItem, window } from 'vscode'
import { Entry } from './interfaces'

export class TreeviewProvider implements TreeDataProvider<Entry> {
  public static tvProvider: TreeviewProvider

  private _onDidChangeTreeData: EventEmitter<null> = new EventEmitter<null>()
  readonly onDidChangeTreeData: Event<null> = this._onDidChangeTreeData.event

  private browser: Browser | undefined

  public static create() {
    const treeDataProvider = new TreeviewProvider()
    window.createTreeView('LMPTM', { treeDataProvider })
    // const tv = window.createTreeView('LMPTM', { treeDataProvider })
    // tv.onDidChangeSelection(({ selection }) => {})
    this.tvProvider = treeDataProvider
  }

  public static refresh() {
    this.tvProvider.refresh()
  }

  constructor() {
    this.browser = Browser.activeBrowser
  }

  getTreeItem(element: Entry): TreeItem {
    return this.getItem(element)
  }

  async getChildren(): Promise<Entry[] | undefined> {
    if (!this.browser) return
    const details = this.browser.getPagesStatus()
    // console.debug('@@@@@@@@', details)
    if (!details) return
    return details
  }

  private getItem(element: Entry) {
    // console.debug(element)

    return new TabItem(element)
  }

  refresh(): void {
    this.browser = Browser.activeBrowser
    this._onDidChangeTreeData.fire(null)
    // console.debug('refresh')
  }
}

class TabItem extends TreeItem {
  constructor(e: Entry) {
    const { picked, state, title } = e
    super(title)
    if (picked && state !== 'none') this.iconPath = new ThemeIcon(state === 'playing' ? 'debug-pause' : 'debug-start')
    else if (state !== 'none') this.iconPath = new ThemeIcon(state === 'playing' ? 'primitive-square' : 'play')
    this.command = { title: 'click', command: 'lmptm.click', arguments: [e] }
  }
}
