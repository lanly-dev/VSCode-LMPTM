import { commands, ConfigurationTarget,ExtensionContext, workspace, window } from 'vscode'
import { Entry } from './interfaces'

import Browser from './browser'
import Buttons from './buttons'
import TreeviewProvider from './treeview'

export function activate(context: ExtensionContext) {
  const buttons = new Buttons()
  const fn = [`playPause`, `skip`, `back`, `forward`, `backward`] as const
  const rc = commands.registerCommand
  TreeviewProvider.create()
  const disposables = fn.map(n => rc(`lmptm.${n}`, () => Browser.activeBrowser?.[n]()))
  context.subscriptions.concat(disposables)
  context.subscriptions.concat([
    rc(`lmptm.browserLaunch`, () => Browser.launch(buttons, context)),
    rc(`lmptm.click`, selection => click(selection)),
    rc(`lmptm.openSettings`, openSettings),
    rc(`lmptm.showTitle`, showTitle),
    rc(`lmptm.toggleMode`, toggleMode),
    rc(`lmptm.tvRefresh`, () => TreeviewProvider.refresh())
  ])
}

function click(selection: Entry) {
  Browser.activeBrowser?.pickTab(selection.index)
}

function openSettings() {
  // doesn't seem to work
  commands.executeCommand(`workbench.action.openSettings`, `@ext:lanly-dev.letmeplaythemusic`)
}

async function showTitle() {
  const title = Browser.activeBrowser?.getTabTitle()
  if (title) window.showInformationMessage(await title)
  else window.showErrorMessage(`Failed to retrieve title`)
}

function toggleMode() {
  const mode = workspace.getConfiguration().get(`lmptm.incognitoMode`)
  workspace.getConfiguration().update(`lmptm.incognitoMode`, !mode, ConfigurationTarget.Global)
  commands.executeCommand(`setContext`, `lmptm.private`, !mode)
  TreeviewProvider.refresh()
}

// export function deactivate() { }
