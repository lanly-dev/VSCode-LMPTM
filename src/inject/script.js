'use strict'
const style = 'background:deepskyblue;padding:1px 2px;border-radius:2px'
const log = (text, ...rest) => console.log(`%c${text}`, style, ...rest)
log(`LMPTM's script injected successfully!`)

const playButtonAttrs = {
  soundcloud: { css: '.playControl' },
  spotify: {
    css: '.control-button--circled',
    svgPath: {
      play: '',
      pause: ''
    }
  },
  youtube: { css: '.ytp-play-button' },
  ytmusic: { css: '#play-pause-button' }
}

const btnPick = document.querySelector('.btn-pick-float')
setupWatcher() // Early enough?
btnPick.addEventListener('click', check)

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

function setupWatcher() {
  const host = window.location.host
  // only youtube and ytmusic updates mediaSession via `set`
  const { soundcloud, spotify, youtube, ytmusic } = playButtonAttrs
  if (host.includes('soundcloud.com')) setupObserver({ soundcloud })
  else if (host.includes('spotify.com')) setupObserver({ spotify })
  else if (host.includes('youtube.com')) setupObserver({ youtube })
  else if (host.includes('music.youtube')) setupObserver({ ytmusic })
  else log('For later release') // setupMediaSession()
}

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

function setupObserver(brandData) {
  const brand = Object.keys(brandData)[0]
  const { css } = brandData[brand]
  const targetE = document.querySelector(css)
  const state = getPlaybackState(brand, brandData[brand])
  const observer = new MutationObserver(() => window.playbackChanged(state))
  if (targetE) observer.observe(targetE, { attributes: true })
}

function getPlaybackState(brand, attrs) {
  if (brand === 'spotify') {
    console.log(attrs)
    return 'playing'
  } else return Navigator.mediaSession.getPlaybackState
}

function check() {
  const btnPick = document.querySelector('.btn-pick-float')
  const host = window.location.host

  if (host.includes('soundcloud.com')) {
    if (!document.querySelectorAll('.m-visible')[0]) {
      btnPick.disabled = true
      return void showInfo(btnPick, 'soundcloud')
    }
    window.pageSelected({ brand: 'soundcloud' })
    sessionStorage.setItem('lmptm', 'soundcloud')
    changeBtnAttr('soundcloud')
    clear = true
  } else if (host.includes('open.spotify.com')) {
    if (!document.querySelectorAll('.now-playing .cover-art-image')[0]) {
      btnPick.disabled = true
      return void showInfo(btnPick, 'spotify')
    }
    window.pageSelected({ brand: 'spotify' })
    sessionStorage.setItem('lmptm', 'spotify')
    changeBtnAttr('spotify')
    clear = true
  } else if (host.includes('www.youtube.com')) {
    if (!host.includes('/watch')) {
      btnPick.disabled = true
      return void showInfo(btnPick, 'youtube')
    }
    window.pageSelected({ brand: 'youtube' })
    sessionStorage.setItem('lmptm', 'youtube')
    changeBtnAttr('youtube')
    clear = true
  } else if (host.includes('music.youtube.com')) {
    const e = 'ytmusic-app-layout[player-visible_] > [slot=player-bar]'
    if (!document.querySelectorAll(e)[0]) {
      btnPick.disabled = true
      return void showInfo(btnPick, 'ytmusic')
    }
    window.pageSelected({ brand: 'ytmusic' })
    sessionStorage.setItem('lmptm', 'ytmusic')
    changeBtnAttr('youtube')
    clear = true
  } else {
    btnPick.className = 'btn-pick-float error'
    btnPick.innerHTML = 'Never mind! 😓'
    btnPick.disabled = true
    btnTimeoutReset(btnPick)
  }
}

function verifyPage() {
  const name = sessionStorage.getItem('lmptm')
  const host = window.location.host
  if (!name) return
  if (name === 'spotify' && host.includes('open.spotify.com')) changeBtnAttr(name)
  else if (name === 'soundcloud' && host.includes('soundcloud.com')) changeBtnAttr(name)
  else if (name === 'youtube' && host.includes('www.youtube.com/watch')) changeBtnAttr(name)
  else if (name === 'ytmusic' && host.includes('music.youtube.com/watch')) changeBtnAttr('youtube')
  else reset()
}

function changeBtnAttr(name) {
  btnPick.className = `btn-pick-float border-gray ${name}`
  btnPick.innerHTML = null
}

function showInfo(btnPick, brand) {
  btnPick.className = `btn-pick-float border-gray ${brand}-info`
  let msg = 'Something is not right...'
  switch (brand) {
    case 'soundcloud':
      msg = 'Please pick a song. 😉'
      break
    case 'spotify':
      msg = 'Please log in and make sure the playing queue is not empty. 😉'
      break
    case 'youtube':
      msg = 'Please pick a video. 😉'
      break
    case 'ytmusic':
      msg = 'Please make sure the playing queue is not empty. 😉'
      break
  }
  btnPick.innerHTML = msg
  btnTimeoutReset(btnPick)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function spotifyAction(action) {
  switch (action) {
    case 'play':
    case 'pause':
      // prettier-ignore
      (document.querySelector('.spoticon-play-16') || document.querySelector('.spoticon-pause-16')).click()
      break
    case 'skip':
      document.querySelector('.spoticon-skip-forward-16').click()
      break
    case 'back':
      document.querySelector('.spoticon-skip-back-16').click()
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
