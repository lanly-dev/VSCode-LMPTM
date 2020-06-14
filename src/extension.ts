import { commands, window, ExtensionContext } from 'vscode'
import { Buttons } from './buttons'
import { Browser } from './browser'

export function activate(context: ExtensionContext) {
  const buttons = new Buttons()
  context.subscriptions.concat([
    commands.registerCommand('lmptm.browserlaunch', () => Browser.launch(buttons, context)),
    commands.registerCommand('lmptm.play', play),
    commands.registerCommand('lmptm.pause', pause),
    commands.registerCommand('lmptm.skip', skip),
    commands.registerCommand('lmptm.back', back),
    commands.registerCommand('lmptm.showTitle', showTitle),
  ])
}

function play() {
  if (Browser.activeBrowser) Browser.activeBrowser.play()
}

function pause() {
  if (Browser.activeBrowser) Browser.activeBrowser.pause()
}

function skip() {
  if (Browser.activeBrowser) Browser.activeBrowser.skip()
}

function back() {
  if (Browser.activeBrowser) Browser.activeBrowser.back()
}

async function showTitle() {
  if (Browser.activeBrowser) window.showInformationMessage(await Browser.activeBrowser.getTabTitle())
}

export function deactivate() {}
