'use strict'
const style = 'background:deepskyblue;padding:1px 2px;border-radius:2px'
const log = (text, ...rest) => console.log(`%c${text}`, style, ...rest)
log(`LMPTM's script injected successfully!`)

const PICK_MSG = '⛏️ Pick?'
const playButtonAttrs = {
  soundcloud: {
    css: '.playControl',
    cssCover: '.m-visible'
  },
  spotify: {
    css: 'button[data-testid="control-button-playpause"]',
    cssAll5Btns: '.player-controls button',
    cssTitle: 'div[data-testid="now-playing-widget"]',
    play: 'M4.018 14L14.41 8 4.018 2z'
  },
  youtube: { css: '.ytp-play-button' },
  ytmusic: { css: '#play-pause-button' }
}

let observer
const btnPick = document.createElement('button')
btnPick.innerHTML = PICK_MSG
btnPick.className = 'btn-pick-float'
document.body.appendChild(btnPick)
btnPick.addEventListener('click', click)

// Duplicate tabs solution
// TODO: need note
let clear = false
let loadCount = sessionStorage.getItem('load')
loadCount === null ? (loadCount = 0) : loadCount++
sessionStorage.setItem('load', loadCount)
let unloadCount = sessionStorage.getItem('unload')
unloadCount = unloadCount === null ? 0 : parseInt(unloadCount)
if (loadCount === unloadCount) verifyPage()

window.addEventListener('beforeunload', () => {
  if (clear) {
    sessionStorage.removeItem('load')
    sessionStorage.removeItem('unload')
    return
  }
  sessionStorage.setItem('unload', unloadCount + 1)
})

function click() {
  const btnPick = document.querySelector('.btn-pick-float')
  const href = window.location.href
  let brand

  if (href.includes('soundcloud.com')) {
    if (!document.querySelector('.m-visible')) {
      btnPick.disabled = true
      return void showInfo(btnPick, 'soundcloud')
    }
    brand = 'soundcloud'
  } else if (href.includes('open.spotify.com')) {
    if (!navigator.mediaSession.metadata.title) {
      btnPick.disabled = true
      return void showInfo(btnPick, 'spotify')
    }
    brand = 'spotify'
  } else if (href.includes('www.youtube.com')) {
    if (!href.includes('/watch')) {
      btnPick.disabled = true
      return void showInfo(btnPick, 'youtube')
    }
    brand = 'youtube'
  } else if (href.includes('music.youtube.com')) {
    const e = 'ytmusic-app-layout[player-visible_] > [slot=player-bar]'
    if (!document.querySelectorAll(e)[0]) {
      btnPick.disabled = true
      return void showInfo(btnPick, 'ytmusic')
    }
    brand = 'ytmusic'
  } else {
    btnPick.className = 'btn-pick-float error'
    btnPick.innerHTML = 'Never mind! 😓'
    btnPick.disabled = true
    btnTimeoutReset(btnPick)
  }

  if (brand) {
    window.pageSelected()
    sessionStorage.setItem('lmptm', brand)
    changeBtnAttr(brand)
    clear = true
  }
}

// For supporting other sites later?
// function setupMediaSession() {
//   const proxyHandler = {
//     get(target, prop) {
//       log('get', prop)
//       const value = target[prop]
//       if (typeof value === 'function') {
//         const fn = value.bind(target)
//         return fn
//       }
//       return value
//     },
//     set(target, prop, value) {
//       target[prop] = value
//       log('set', prop)
//       if (prop[0] === 'playbackState') window.playbackChanged()
//       return true
//     }
//   }
//   Object.defineProperty(navigator, 'mediaSession', {
//     // eslint-disable-next-line no-undef
//     value: new Proxy(navigator.mediaSession, proxyHandler)
//   })
// }

function setupObserver(brand) {
  const { css } = playButtonAttrs[brand]
  if (observer) observer.disconnect()
  const targetE = document.querySelector(css)
  let state = getPlaybackState(brand, css)
  if (brand === 'soundcloud' && state === 'none') state = 'paused'
  window.playbackChanged(state)

  observer = new MutationObserver(() => {
    const state = getPlaybackState(brand)
    window.playbackChanged(state)
  })
  if (targetE) observer.observe(targetE, { attributes: true })

  // Spotify doesn't fire playbackChanged when skip/back a song
  if (brand === 'spotify') {
    const { cssTitle } = playButtonAttrs.spotify
    const targetE2 = document.querySelector(cssTitle)
    // Observer can watch multiple elements :)
    if (targetE2) observer.observe(targetE2, { attributes: true })
  }
}

function getPlaybackState(brand) {
  // spotify doesn't update the mediaSession.playbackState
  if (brand === 'spotify') {
    const { css, play } = playButtonAttrs.spotify
    const d = document.querySelector(`${css} svg path:last-child`).getAttribute('d')
    const state = d === play ? 'paused' : 'playing'
    return state
  } else return navigator.mediaSession.playbackState
}

function verifyPage() {
  const brand = sessionStorage.getItem('lmptm')
  const href = window.location.href
  if (!brand) return
  if (brand === 'spotify' && href.includes('open.spotify.com')) changeBtnAttr(brand)
  else if (brand === 'soundcloud' && href.includes('soundcloud.com')) changeBtnAttr(brand)
  else if (brand === 'youtube' && href.includes('www.youtube.com/watch')) changeBtnAttr(brand)
  else if (brand === 'ytmusic' && href.includes('music.youtube.com/watch')) changeBtnAttr(brand)
  else reset()
}

function changeBtnAttr(brand) {
  setupObserver(brand)
  if (brand === 'ytmusic') brand = 'youtube'
  btnPick.className = `btn-pick-float border-gray ${brand}`
  btnPick.innerHTML = null
}

function showInfo(btnPick, brand) {
  btnPick.className = `btn-pick-float border-gray ${brand}-info`
  let msg = 'Something is not right...'
  switch (brand) {
    case 'soundcloud':
      msg = 'Please pick a song 😉'
      break
    case 'spotify':
      msg = 'Please log in and make sure the playing queue is not empty 😉'
      break
    case 'youtube':
      msg = 'Please pick a video 😉'
      break
    case 'ytmusic':
      msg = 'Please make sure the playing queue is not empty 😉'
      break
  }
  btnPick.innerHTML = msg
  btnTimeoutReset(btnPick)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function spotifyAction(action) {
  const { cssAll5Btns } = playButtonAttrs.spotify
  const actionBtn = document.querySelectorAll(cssAll5Btns)
  switch (action) {
    case 'skip':
      actionBtn[3].click()
      break
    case 'back':
      actionBtn[1].click()
      break
  }
}

function btnTimeoutReset(btnPick) {
  setTimeout(() => {
    btnPick.innerHTML = '⛏️ Pick?'
    btnPick.className = 'btn-pick-float'
    btnPick.disabled = false
  }, 3000)
}

function reset() {
  const btnPick = document.querySelector('.btn-pick-float')
  btnPick.innerHTML = '⛏️ Pick?'
  btnPick.className = 'btn-pick-float'
  sessionStorage.removeItem('lmptm')
}
