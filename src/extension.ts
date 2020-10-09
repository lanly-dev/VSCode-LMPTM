import { commands, window, ExtensionContext } from 'vscode'
import { Buttons } from './buttons'
import { Browser } from './browser'

export function activate(context: ExtensionContext) {
  const buttons = new Buttons()
  context.subscriptions.concat([
    commands.registerCommand('lmptm.browserlaunch', () => Browser.launch(buttons, context)),
    commands.registerCommand('lmptm.play', () => Browser.activeBrowser?.play()),
    commands.registerCommand('lmptm.pause', () => Browser.activeBrowser?.pause()),
    commands.registerCommand('lmptm.skip', () => Browser.activeBrowser?.skip()),
    commands.registerCommand('lmptm.back', () => Browser.activeBrowser?.back()),
    commands.registerCommand('lmptm.forward', () => Browser.activeBrowser?.forward()),
    commands.registerCommand('lmptm.backward', () => Browser.activeBrowser?.backward()),
    commands.registerCommand('lmptm.toggle', () => Browser.activeBrowser?.toggle()),
    commands.registerCommand('lmptm.showTitle', showTitle)
  ])
}

async function showTitle() {
  const title = Browser.activeBrowser?.getTabTitle()
  if (title) window.showInformationMessage(await title)
  else window.showErrorMessage('Failed to retrieve title')
}

export function deactivate() {}
