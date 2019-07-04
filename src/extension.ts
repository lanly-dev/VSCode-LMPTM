import * as vscode from 'vscode'

// @ts-ignore
import * as whichChrome from 'which-chrome'

import { Buttons } from './buttons'
import { Browser } from './browser'

export function activate(context: vscode.ExtensionContext) {
  const buttons = new Buttons
  const d1 = vscode.commands.registerCommand('lmptm.browserlaunch', () => browserLaunch(buttons))
  const d2 = vscode.commands.registerCommand('lmptm.play', play)
  const d3 = vscode.commands.registerCommand('lmptm.pause', pause)
  const d4 = vscode.commands.registerCommand('lmptm.skip', skip)
  const d5 = vscode.commands.registerCommand('lmptm.back', back)
  context.subscriptions.concat([d1, d2, d3, d4, d5])
}

function browserLaunch(buttons: Buttons) {
  const chromePath = whichChrome.Chrome || whichChrome.Chromium
  if (!chromePath) {
    vscode.window.showErrorMessage(`No Chrome or Chromium installation found! 😕`)
  } else {
    Browser.launch(buttons)
  }
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

export function deactivate() { }
