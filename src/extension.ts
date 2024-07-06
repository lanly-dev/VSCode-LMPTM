import { commands, window, ExtensionContext } from 'vscode'
import { Entry } from './interfaces'
import Browser from './browser'
import Buttons from './buttons'
import TreeviewProvider from './treeview'

export function activate(context: ExtensionContext) {
  const buttons = new Buttons()
  const fn = <const>['playPause', 'skip', 'back', 'forward', 'backward']
  const rc = commands.registerCommand
  TreeviewProvider.create()
  const disposables = fn.map(n => rc(`lmptm.${n}`, () => Browser.activeBrowser?.[n]()))
  context.subscriptions.concat(disposables)
  context.subscriptions.concat([
    rc('lmptm.browserLaunch', () => {
      try {
        Browser.launch(buttons, context)
      } catch (error) {
        console.debug(error)
      }
    }),
    rc('lmptm.tvRefresh', () => TreeviewProvider.refresh()),
    rc('lmptm.showTitle', showTitle),
    rc('lmptm.click', selection => click(selection))
  ])
}

async function showTitle() {
  const title = Browser.activeBrowser?.getTabTitle()
  if (title) window.showInformationMessage(await title)
  else window.showErrorMessage('Failed to retrieve title')
}

function click(selection: Entry) {
  Browser.activeBrowser?.pickTab(selection.index)
}

// export function deactivate() { }
