import * as vscode from 'vscode'
import { Buttons } from './buttons'
import { Browser } from './browser'

export function activate(context: vscode.ExtensionContext) {
  const buttons = new Buttons
  const d1 = vscode.commands.registerCommand('lmptm.browserlaunch', () => Browser.launch(buttons, context))
  const d2 = vscode.commands.registerCommand('lmptm.play', play)
  const d3 = vscode.commands.registerCommand('lmptm.pause', pause)
  const d4 = vscode.commands.registerCommand('lmptm.skip', skip)
  const d5 = vscode.commands.registerCommand('lmptm.back', back)
  const d6 = vscode.commands.registerCommand('lmptm.showTitle', showTitle)
  context.subscriptions.concat([d1, d2, d3, d4, d5, d6])
}

function play() {
  if (Browser.activeBrowser)
    Browser.activeBrowser.play()
}

function pause() {
  if (Browser.activeBrowser)
    Browser.activeBrowser.pause()
}

function skip() {
  if (Browser.activeBrowser)
    Browser.activeBrowser.skip()
}

function back() {
  if (Browser.activeBrowser)
    Browser.activeBrowser.back()
}

async function showTitle() {
  if (Browser.activeBrowser)
    vscode.window.showInformationMessage(await Browser.activeBrowser.getTabTitle())
}

export function deactivate() { }