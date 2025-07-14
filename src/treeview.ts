import { Entry } from './interfaces'
import { Event, EventEmitter, ThemeIcon, TreeDataProvider, TreeItem, window } from 'vscode'
import Lmptm from './lmptm'
import Browser from './browser/browser'

export default class TreeviewProvider implements TreeDataProvider<Entry> {
  public static tvProvider: TreeviewProvider

  private _onDidChangeTreeData: EventEmitter<null> = new EventEmitter<null>()
  readonly onDidChangeTreeData: Event<null> = this._onDidChangeTreeData.event

  private browser: Browser | undefined

  public static create() {
    const treeDataProvider = new TreeviewProvider()
    window.createTreeView(`LMPTM`, { treeDataProvider })
    // const tv = window.createTreeView('LMPTM', { treeDataProvider })
    // tv.onDidChangeSelection(({ selection }) => {})
    this.tvProvider = treeDataProvider
  }

  public static refresh() {
    this.tvProvider.refresh()
  }

  constructor() {
    this.browser = Lmptm.activeBrowser
  }

  getTreeItem(element: Entry): TreeItem {
    return this.getItem(element)
  }

  async getChildren(): Promise<Entry[] | undefined> {
    return this?.browser?.getPagesStatus()
  }

  private getItem(element: Entry) {
    // console.debug(element)
    return new TabItem(element)
  }

  refresh(): void {
    this.browser = Lmptm.activeBrowser
    this._onDidChangeTreeData.fire(null)
    // console.debug(`refresh`)
  }
}

class TabItem extends TreeItem {
  constructor(e: Entry) {
    const { picked, state } = e
    let title = e.title
    if (picked) title = `⛏️ ${title}`
    super(title)
    if (state !== `none`) this.iconPath = new ThemeIcon(state === `playing` ? `primitive-square` : `play`)
    this.command = { title: `click`, command: `lmptm.click`, arguments: [e] }
  }
}
