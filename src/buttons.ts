import { window, StatusBarItem, StatusBarAlignment } from 'vscode'

export class Buttons {
  private playButton: StatusBarItem
  private skipButton: StatusBarItem
  private backButton: StatusBarItem
  private statusButton: StatusBarItem

  constructor() {
    this.skipButton = window.createStatusBarItem(StatusBarAlignment.Right, 1)
    this.playButton = window.createStatusBarItem(StatusBarAlignment.Right, 2)
    this.backButton = window.createStatusBarItem(StatusBarAlignment.Right, 3)
    this.statusButton = window.createStatusBarItem(StatusBarAlignment.Right, 4)

    this.playButton.text = '$(play)'
    this.skipButton.text = '$(chevron-right)'
    this.backButton.text = '$(chevron-left)'
    this.statusButton.text = 'Launch $(rocket)'

    this.statusButton.command = 'lmptm.browserLaunch'
    this.playButton.command = 'lmptm.play'
    this.backButton.command = 'lmptm.back'
    this.skipButton.command = 'lmptm.skip'

    this.statusButton.show()
  }

  setStatusButtonText(text: string) {
    if (text === 'Launch $(rocket)') {
      this.statusButton.text = text
      this.statusButton.command = 'lmptm.browserLaunch'
    } else if (text === 'Running $(browser)') {
      this.statusButton.text = text
      this.statusButton.command = undefined
    } else if (text.length > 30) {
      this.statusButton.text = `${text.substring(0, 15)}...`
      this.statusButton.command = 'lmptm.showTitle'
    } else {
      this.statusButton.text = text
      this.statusButton.command = 'lmptm.showTitle'
    }
  }

  setPlayButton(text: string | undefined) {
    if (text === 'play') {
      this.playButton.text = '$(play)'
      this.playButton.command = 'lmptm.play'
    } else {
      this.playButton.text = '$(debug-pause)'
      this.playButton.command = 'lmptm.pause'
    }
  }

  displayPlayback(flag: boolean) {
    if (flag) {
      this.playButton.show()
      this.skipButton.show()
      this.backButton.show()
    } else {
      this.playButton.hide()
      this.skipButton.hide()
      this.backButton.hide()
    }
  }
}
