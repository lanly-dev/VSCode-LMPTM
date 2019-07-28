
const button = document.querySelector('.btn-float')
button.addEventListener('click', check)

// Duplicate tab solution
let clear = false
let loadCount = sessionStorage.getItem('load')
if (loadCount == null) loadCount = 0
else loadCount++
sessionStorage.setItem('load', loadCount)
let unloadCount = sessionStorage.getItem('unload')
if (unloadCount == null) unloadCount = 0

window.addEventListener('beforeunload',() => {
  if (clear) {
    sessionStorage.removeItem('load')
    sessionStorage.removeItem('unload')
    return
  }
  sessionStorage.setItem('unload', unloadCount++)
})

let flag = false
if (loadCount == unloadCount) {
  const data = sessionStorage.getItem('lmptm')
  if (data == 'youtube') youtube(button)
  else if (data == 'soundcloud') soundcloud(button)
}

function check() {
  const button = document.querySelector('.btn-float')
  if (window.location.href.includes('youtube.com/watch')) {
    window.pageSelected({ brand: 'youtube' })
    sessionStorage.setItem('lmptm','youtube')
    youtube(button)
    clear = true
  } else if (window.location.href.includes('soundcloud.com')) {
    window.pageSelected({ brand: 'soundcloud' })
    sessionStorage.setItem('lmptm','soundcloud')
    soundcloud(button)
    clear = true
  }
  else {
    button.className = 'btn-float error'
    button.innerHTML = '<i class="fas fa-times-circle"></i> Nevermind! 😓'
    button.disabled = true

    if (!flag) {
      flag = true
      setTimeout(() => {
        button.innerHTML = '<i class="fas fa-mouse-pointer"></i> Pick?'
        button.className = 'btn-float'
        button.disabled = false
        flag = false
      },3000)
    }
  }
}

function youtube(button) {
  button.className = 'btn-float youtube'
  button.innerHTML = '<i class="fab fa-youtube"></i>'
}

function soundcloud(button) {
  button.className = 'btn-float soundcloud'
  button.innerHTML = '<i class="fab fa-soundcloud"></i>'
}

function reset() {
  const button = document.querySelector('.btn-float')
  button.innerHTML = '<i class="fas fa-mouse-pointer"></i> Pick?'
  button.className = 'btn-float'
  sessionStorage.removeItem('lmptm')
}