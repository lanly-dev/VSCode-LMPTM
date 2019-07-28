let flag = false
const button = document.querySelector('.btn-float')
const data = sessionStorage.getItem('lmptm')
button.addEventListener('click', check)
if(data == 'youtube') youtube(button)
else if (data == 'soundcloud') soundcloud(button)

function check() {
  const button = document.querySelector('.btn-float')
  if (window.location.href.includes('youtube.com/watch')) {
    window.pageSelected({ brand: 'youtube' })
    sessionStorage.setItem('lmptm','youtube')
    youtube(button)
  } else if (window.location.href.includes('soundcloud.com')) {
    window.pageSelected({ brand: 'soundcloud' })
    sessionStorage.setItem('lmptm','soundcloud')
    soundcloud(button)
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