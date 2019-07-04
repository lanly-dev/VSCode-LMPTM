import { window, StatusBarItem, StatusBarAlignment } from 'vscode'

export class Buttons {
  private playButton: StatusBarItem
  private skipButton: StatusBarItem
  private backButton: StatusBarItem
  private statusButton: StatusBarItem
  private broswerLaunched: true | false
  private getPlayState: string

  constructor() {
    this.skipButton = window.createStatusBarItem(StatusBarAlignment.Right, 1)
    this.playButton = window.createStatusBarItem(StatusBarAlignment.Right, 2)
    this.backButton = window.createStatusBarItem(StatusBarAlignment.Right, 3)
    this.statusButton = window.createStatusBarItem(StatusBarAlignment.Right, 4)

    this.getPlayState = 'playing'
    this.broswerLaunched = false

    this.playButton.text = '▶'
    this.skipButton.text = '⏭'
    this.backButton.text = '⏮'
    this.statusButton.text = 'Launch'

    this.playButton.show()
    this.skipButton.show()
    this.backButton.show()
    this.statusButton.show()

    this.statusButton.command = 'lmptm.browserlaunch'
    this.playButton.command = 'lmptm.play'
    this.backButton.command = 'lmptm.back'
    this.skipButton.command = 'lmptm.skip'
  }

  setStatusButtonText(text: string) {
    this.statusButton.text = text
  }

  setPlayButton(text: string) {
    if (text === 'play') {
      this.playButton.text = '▶'
      this.playButton.command = 'lmptm.play'
    }
    else {
      this.playButton.text = '||'
      this.playButton.command = 'lmptm.pause'
    }
  }
}
