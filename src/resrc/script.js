console.log('working')

function check(elem) {
  const button = $(elem)
  if (window.location.href.includes('youtube.com/watch')) {
    window.pageSelected({ brand: 'youtube' })
    youtube()
  }
  else {
    elem.className = 'btn-float error'
    button.html('<i class="fas fa-times-circle"></i> Nevermind! 😓')
  }

  function youtube() {
    elem.className = 'btn-float youtube'
    button.html('<i class="fab fa-youtube"></i> Youtube')
  }
}
