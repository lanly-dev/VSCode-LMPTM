import {window, StatusBarItem, StatusBarAlignment} from 'vscode'

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
        this.statusButton.text = 'open'
        this.playButton.show()
        this.skipButton.show()
        this.backButton.show()
        this.statusButton.show()
        this.statusButton.command = 'LetMePlayTheMusic.browserlaunch'
        this.playButton.command = 'LetMePlayTheMusic.playpause'
        this.backButton.command = 'LetMePlayTheMusic.back'
        this.skipButton.command = 'LetMePlayTheMusic.skip'
    }

    setLauchedState(boolean: true | false) {
        this.broswerLaunched = boolean
    }
}