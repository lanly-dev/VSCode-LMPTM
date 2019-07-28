let flag = false

function check() {
  const button = document.querySelector('.btn-float')
  if (window.location.href.includes('youtube.com/watch')) {
    window.pageSelected({ brand: 'youtube' })
    youtube()
  } else if (window.location.href.includes('soundcloud.com')) {
    window.pageSelected({ brand: 'soundcloud' })
    soundcloud()
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
        flag = false
        button.disabled = false
      }, 3000)
    }
  }

  function youtube() {
    button.className = 'btn-float youtube'
    button.innerHTML = '<i class="fab fa-youtube"></i>'
  }

  function soundcloud() {
    button.className = 'btn-float soundcloud'
    button.innerHTML = '<i class="fab fa-soundcloud"></i>'
  }
}

function reset() {
  const button = document.querySelector('.btn-float')
  button.innerHTML = '<i class="fas fa-mouse-pointer"></i> Pick?'
  button.className = 'btn-float'
}