import { Event, EventEmitter, TreeDataProvider, TreeItem, window } from 'vscode'
import { Browser } from './browser'

export interface Entry {
  title: string
  brand: string
  status: string
}

export class Treeview implements TreeDataProvider<Entry> {
  public static tv: Treeview

  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>()
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event

  private browser: Browser | undefined

  public static create() {
    const tv = new Treeview()
    window.createTreeView('LMPTM', { treeDataProvider: tv })
    this.tv = tv
  }

  public static refresh() {
    this.tv.refresh()
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
    return new TreeItem(element.title)
  }

  refresh(): void {
    this.browser = Browser.activeBrowser
    this._onDidChangeTreeData.fire(undefined)
    // console.debug('refresh')
  }
}
