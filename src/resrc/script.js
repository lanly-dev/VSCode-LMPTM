const btnPick = document.querySelector('.btn-pick-float')
// const btnCSP = document.querySelector('.btn-csp-float')
btnPick.addEventListener('click',check)
// btnCSP.addEventListener('click',csp)

if(sessionStorage.getItem('bypassCSP')) btnCSP.style.display = 'block'

// Duplicate tab solution
let clear = false
let loadCount = sessionStorage.getItem('load')
if (loadCount == null) loadCount = 0
else loadCount++
sessionStorage.setItem('load',loadCount)
let unloadCount = sessionStorage.getItem('unload')
if (unloadCount == null) unloadCount = 0

window.addEventListener('beforeunload',() => {
  if (clear) {
    sessionStorage.removeItem('load')
    sessionStorage.removeItem('unload')
    return
  }
  sessionStorage.setItem('unload',unloadCount++)
})

let flagPick = false
// let flagCSP = false
if (loadCount == unloadCount) {
  const data = sessionStorage.getItem('lmptm')
  if (data == 'spotify') spotify(btnPick)
  else if (data == 'soundcloud') soundcloud(btnPick)
  else if (data == 'youtube') youtube(btnPick)
}

function check() {
  const btnPick = document.querySelector('.btn-pick-float')

  if (window.location.href.includes('soundcloud.com')) {
    window.pageSelected({ brand: 'soundcloud' })
    sessionStorage.setItem('lmptm','soundcloud')
    soundcloud(btnPick)
    clear = true

  } else if (window.location.href.includes('open.spotify.com')) {
    window.pageSelected({ brand: 'spotify' })
    sessionStorage.setItem('lmptm','spotify')
    spotify(btnPick)
    clear = true

  } else if (window.location.href.includes('youtube.com/watch')) {
    window.pageSelected({ brand: 'youtube' })
    sessionStorage.setItem('lmptm','youtube')
    youtube(btnPick)
    clear = true

  } else {
    btnPick.className = 'btn-pick-float error'
    btnPick.innerHTML = '<i class="fas fa-times-circle"></i> Nevermind! 😓'
    btnPick.disabled = true

    if (!flagPick) {
      flagPick = true
      setTimeout(() => {
        btnPick.innerHTML = '<i class="fas fa-mouse-pointer"></i> Pick?'
        btnPick.className = 'btn-pick-float'
        btnPick.disabled = false
        flagPick = false
      },3000)
    }
  }
}

function soundcloud(btnPick) {
  btnPick.className = 'btn-pick-float soundcloud'
  btnPick.innerHTML = '<i class="fab fa-soundcloud"></i>'
}

function spotify(btnPick) {
  btnPick.className = 'btn-pick-float spotify'
  btnPick.innerHTML = '<i class="fab fa-spotify"></i>'
}

function youtube(btnPick) {
  btnPick.className = 'btn-pick-float youtube'
  btnPick.innerHTML = '<i class="fab fa-youtube"></i>'
}

function spotifyAction(action) {
  switch (action) {
    case 'play':
      document.querySelector('.spoticon-play-16').click()
      break
    case 'pause':
      document.querySelector('.spoticon-pause-16').click()
      break
    case 'skip':
      document.querySelector('.spoticon-skip-forward-16').click()
      break
    case 'back':
      document.querySelector('.spoticon-skip-back-16').click()
      break
  }
}

function reset() {
  const btnPick = document.querySelector('.btn-pick-float')
  btnPick.innerHTML = '<i class="fas fa-mouse-pointer"></i> Pick?'
  btnPick.className = 'btn-pick-float'
  sessionStorage.removeItem('lmptm')
}

// function csp() {
//   const btnCSP = document.querySelector('.btn-csp-float')
//   btnCSP.innerHTML = '<p>⚠️ CSP disabled, <a href="https://en.wikipedia.org/wiki/Content_Security_Policy">More info!</a></p>'
//   btnCSP.className = 'btn-csp-float info-csp'
//   btnCSP.disabled = true
//   if (!flagCSP) {
//     flagCSP = true
//     setTimeout(() => {
//       btnCSP.innerHTML = '<i class="fas fa-exclamation-triangle"></i>'
//       btnCSP.className = 'btn-csp-float'
//       btnCSP.disabled = false
//       flagCSP = false
//     },3000)
//   }
// }