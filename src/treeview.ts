import { Browser } from './browser'
import { Event, EventEmitter, ThemeIcon, TreeDataProvider, TreeItem, window } from 'vscode'

export interface Entry {
  brand: string
  title: string
  status: string
}

export class TreeviewProvider implements TreeDataProvider<Entry> {
  public static tvProvider: TreeviewProvider

  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>()
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event

  private browser: Browser | undefined

  public static create() {
    const treeDataProvider = new TreeviewProvider()
    const tv = window.createTreeView('LMPTM', { treeDataProvider })
    // tv.onDidChangeSelection(({ selection }) => {})
    console.debug(tv.description)
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
    const details = await this.browser.getDetails()
    if (!details) return
    return details
  }

  private getItem(element: Entry) {
    // console.debug(element)

    return new tabItem(element)
  }

  refresh(): void {
    this.browser = Browser.activeBrowser
    this._onDidChangeTreeData.fire(undefined)
    // console.debug('refresh')
  }
}

class tabItem extends TreeItem {
  constructor(e: Entry) {
    const { title, status } = e
    super(title)
    if (status) this.iconPath = status === 'play' ? new ThemeIcon('debug-pause') : new ThemeIcon('debug-start')
    this.command = { title: 'click', command: 'lmptm.click', arguments: [e] }
  }
}
