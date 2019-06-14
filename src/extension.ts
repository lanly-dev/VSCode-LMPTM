import * as vscode from 'vscode'

// @ts-ignore
import * as whichChrome from 'which-chrome'

import { Buttons } from './buttons'
import { Browser } from './browser'

let browser: Browser

export function activate(context: vscode.ExtensionContext) {
  new Buttons()
  const d1 = vscode.commands.registerCommand('lmptm.browserlaunch', browserLaunch)
  const d2 = vscode.commands.registerCommand('lmptm.playpause', playpause)
  const d3 = vscode.commands.registerCommand('lmptm.skip', skip)
  const d4 = vscode.commands.registerCommand('lmptm.back', back)
  context.subscriptions.concat([d1, d2, d3, d4])
}

function browserLaunch() {
  const chromePath = whichChrome.Chrome || whichChrome.Chromium
  if (!chromePath) {
    vscode.window.showErrorMessage(`No Chrome or Chromium installation found! 😕`)
  } else {
    if (!browser) browser = new Browser()
  }
}

function playpause() {
  browser.playPause()
}

function skip() {
  browser.skip()
}

function back() {
  browser.back()
}

export function deactivate() {}
