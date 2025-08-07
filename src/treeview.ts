import { Entry } from './interfaces'
import {
  EventEmitter, FileDecoration, FileDecorationProvider, ProviderResult, ThemeColor, ThemeIcon, TreeDataProvider,
  TreeItem, Uri, window
} from 'vscode'
import Lmptm from './lmptm'
import Browser from './browser/browser'

export default class TreeviewProvider implements TreeDataProvider<Entry> {
  private static tvProvider: TreeviewProvider
  private static fdProvider: LmptmDecorationProvider

  private _onDidChangeTreeData = new EventEmitter<null>()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event

  private browser: Browser | undefined

  public static create() {
    const fileDecorationProvider = new LmptmDecorationProvider()
    const treeDataProvider = new TreeviewProvider()
    window.createTreeView(`LMPTM`, { treeDataProvider })
    // const tv = window.createTreeView('LMPTM', { treeDataProvider })
    // tv.onDidChangeSelection(({ selection }) => {})
    window.registerFileDecorationProvider(fileDecorationProvider)
    this.tvProvider = treeDataProvider
    this.fdProvider = fileDecorationProvider
  }

  public static refresh() {
    this.tvProvider.refresh()
    this.fdProvider.refresh()
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
    super(title)
    this.tooltip = title
    if (state !== `none`) {
      this.iconPath = new ThemeIcon(state === `playing` ? `debug-pause` : `play`)
      let uri = `lmptm://${state}`
      if (picked) uri = `${uri}/picked`
      if (state === `playing`) uri = `${uri}/playing`
      else if (state === `paused`) uri = `${uri}/paused`
      this.resourceUri = Uri.parse(uri)
    }
    this.command = { title: `click`, command: `lmptm.click`, arguments: [e] }
  }
}

class LmptmDecorationProvider implements FileDecorationProvider {
  private _emitter = new EventEmitter<undefined>()
  readonly onDidChangeFileDecorations = this._emitter.event

  provideFileDecoration(uri: Uri): ProviderResult<FileDecoration> {
    if (!uri.scheme.startsWith(`lmptm`)) return
    let badge, tooltip, color
    if (uri.path.includes(`picked`)) badge = '⛏️'
    if (uri.path.includes(`playing`)) {
      tooltip = 'Playing'
      color = new ThemeColor('charts.green')
    }
    if (uri.path.includes(`paused`)) {
      tooltip = 'Paused'
      color = new ThemeColor('charts.yellow')
    }
    return { badge, color, tooltip }
  }

  refresh() {
    this._emitter.fire(undefined)
  }
}
