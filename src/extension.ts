import { commands, window, ExtensionContext } from 'vscode'
import { Browser } from './browser'
import { Buttons } from './buttons'
import { Treeview } from './treeview'

export function activate(context: ExtensionContext) {
  const buttons = new Buttons()
  const fn = ["play", "pause", "skip", "back", "forward", "backward", "toggle"] as const
  Treeview.create()
  const disposables = fn.map(n => commands.registerCommand(`lmptm.${n}`, () => Browser.activeBrowser?.[n]()))
  context.subscriptions.concat(disposables)
  context.subscriptions.concat([
    commands.registerCommand('lmptm.browserLaunch', () => Browser.launch(buttons, context)),
    commands.registerCommand('lmptm.tvRefresh', () => Treeview.refresh()),
    commands.registerCommand('lmptm.showTitle', showTitle)
  ])
}

async function showTitle() {
  const title = Browser.activeBrowser?.getTabTitle()
  if (title) window.showInformationMessage(await title)
  else window.showErrorMessage('Failed to retrieve title')
}

export function deactivate() { }
