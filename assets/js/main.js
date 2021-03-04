const apiURL = 'http://localhost:3000/'
const storageKey = 'fox_anime_access_token'
$(() => {
  showOnly('#login')
  delete localStorage[storageKey]
  $('#anchor-to-register').on('click', (event) => {
    event.preventDefault()
    showOnly('#register')
  })

  $('#form-login').on('submit', (event) => {
    event.preventDefault()
    const data = parseInput('#form-login')
    return $.ajax({
      method: 'POST',
      url: generateURL('login'),
      data,
    })
      .done((token) => {
        setStorage(token)
        showOnly('#list-anime')
      })
      .fail((error) => {
        console.error(error)
        errorHandler('#login', error)
      })
  })

  $('#anchor-to-login').on('click', (event) => {
    event.preventDefault()
    showOnly('#login')
  })

  $('#form-register').on('submit', (event) => {
    event.preventDefault()

    const data = parseInput('#form-register')
    $.ajax({
      method: 'POST',
      url: generateURL('register'),
      data,
    })
      .done((token) => {
        setStorage(token)
        showOnly('#login')
      })
      .fail((error) => {
        console.error(error)
        errorHandler('#register', error)
      })
  })

  $('#link-anime-list').on('click', (event) => {
    event.preventDefault()
    console.log(localStorage[storageKey])
    if (!localStorage[storageKey]) showOnly('#login')
    else showOnly('#list-anime')
  })

  $('#link-image-search').on('click', (event) => {
    event.preventDefault()
    showOnly('#search-image')
  })

  $('#link-sign-out').on('click', (event) => {
    event.preventDefault()
    delete localStorage[storageKey]
    showOnly('#login')
  })

  $('[id*="anime-calculate-"]').on('click', (event) => {
    event.preventDefault()
    showOnly('#form-input')
  })

  $('#form-episode-per-day').on('submit', (event) => {
    event.preventDefault()
    showOnly('#calculation-date')
  })
})

function showOnly(selector) {
  $('section').hide()
  $('#navigation').show()
  if (selector === '#login' || selector === '#register') {
    $('#nav-links').hide()
  } else {
    $('#nav-links').show()
  }
  $(selector).show()
}

function setStorage(key) {
  localStorage[storageKey] = key
}

function getStorage(key) {
  return localStorage[storageKey]
}

function errorAlert(error) {
  return `
  <div class="alert alert-danger" role="alert">
    ${error}
  </div>
  `
}

// helpers

const generateURL = (str) => apiURL + str

const errorHandler = (partial, error) => {
  $(`${partial} .error-message`).empty()
  console.log(partial)
  error.responseJSON.message.forEach((error) => {
    $(`${partial} .error-message`).append(errorAlert(error))
  })
}

const parseInput = (value) => {
  return $(value)
    .serializeArray()
    .reduce((result, e) => {
      result[e.name] = e.value
      return result
    }, {})
}
