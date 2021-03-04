$(() => {
  showOnly('#login')
})

function showOnly(selector) {
  $('section').hide()
  $(selector).show()
}
