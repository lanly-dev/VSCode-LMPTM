let flag = false

function check(elem) {
  const button = $(elem)
  if (window.location.href.includes('youtube.com/watch')) {
    window.pageSelected({ brand: 'youtube' })
    youtube()
  }
  else {
    elem.className = 'btn-float error'
    button.html('<i class="fas fa-times-circle"></i> Nevermind! 😓')

    if (!flag) {
      flag = true
      setTimeout(() => {
        button.html('<i class="fas fa-mouse-pointer"></i> Pick?')
        elem.className = 'btn-float'
        flag = false
      }, 3000)
    }
  }

  function youtube() {
    elem.className = 'btn-float youtube'
    button.html('<i class="fab fa-youtube"></i> Youtube')
  }
}

function reset() {
  const button =$('.btn-float')
  button.html('<i class="fas fa-mouse-pointer"></i> Pick?')
  button.attr('class', 'btn-float')
}