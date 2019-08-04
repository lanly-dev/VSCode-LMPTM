const btnPick = document.querySelector('.btn-pick-float')
btnPick.addEventListener('click',check)

// Duplicate tab solution
let clear = false
let loadCount = sessionStorage.getItem('load')
if (loadCount == null) loadCount = 0
else loadCount++
sessionStorage.setItem('load',loadCount)
let unloadCount = sessionStorage.getItem('unload')
if (unloadCount == null) unloadCount = 0
else unloadCount = parseInt(unloadCount)

window.addEventListener('beforeunload',() => {
  if (clear) {
    sessionStorage.removeItem('load')
    sessionStorage.removeItem('unload')
    return
  }
  sessionStorage.setItem('unload',unloadCount + 1)
})

let flagPick = false
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
    if (!document.querySelectorAll('.now-playing .cover-art-image')[0]) {
      btnPick.disabled = true
      return spotifyInfo(btnPick)
    }
    window.pageSelected({ brand: 'spotify' })
    sessionStorage.setItem('lmptm','spotify')
    spotify(btnPick)
    clear = true

  } else if (window.location.href.includes('youtube.com')) {
    if (window.location.href.includes('youtube.com/watch')) {
      window.pageSelected({ brand: 'youtube' })
      sessionStorage.setItem('lmptm','youtube')
      youtube(btnPick)
      clear = true
    } else {
      btnPick.disabled = true
      youtubeInfo(btnPick)
    }

  } else {
    btnPick.className = 'btn-pick-float error'
    btnPick.innerHTML = '<i class="fas fa-times-circle"></i> Nevermind! 😓'
    btnPick.disabled = true

    btnReset(btnPick)
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

function spotifyInfo(btnPick) {
  btnPick.className = 'btn-pick-float spotify spotify-info'
  btnPick.innerHTML = 'Please log in and make sure the playing queue is not empty! 😉'
  btnReset(btnPick)
}

function youtubeInfo(btnPick) {
  btnPick.className = 'btn-pick-float youtube youtube-info'
  btnPick.innerHTML = 'Please pick a video! 😉'
  btnReset(btnPick)
}

function spotifyAction(action) {
  switch (action) {
    case 'play':
    case 'pause':
      (document.querySelector(".spoticon-play-16") || document.querySelector(".spoticon-pause-16")).click()
      break
    case 'skip':
      document.querySelector('.spoticon-skip-forward-16').click()
      break
    case 'back':
      document.querySelector('.spoticon-skip-back-16').click()
      break
  }
}

function btnReset(btnPick) {
  setTimeout(() => {
    btnPick.innerHTML = '<i class="fas fa-mouse-pointer"></i> Pick?'
    btnPick.className = 'btn-pick-float'
    btnPick.disabled = false
  },3000)
}

function reset() {
  const btnPick = document.querySelector('.btn-pick-float')
  btnPick.innerHTML = '<i class="fas fa-mouse-pointer"></i> Pick?'
  btnPick.className = 'btn-pick-float'
  sessionStorage.removeItem('lmptm')
}