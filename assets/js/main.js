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
        setStorage(token.access_token)
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
    if (!localStorage[storageKey]) showOnly('#login')
    else showOnly('#list-anime')
  })

  $('#link-image-search').on('click', (event) => {
    event.preventDefault()
    showOnly('#search-image')
  })

  $('#link-sign-out').on('click', (event) => {
    event.preventDefault()
    var auth2 = gapi.auth2.getAuthInstance()
    auth2.signOut().then(function () {
      delete localStorage[storageKey]
      showOnly('#login')
    })
  })

  $('#form-image-search').on('submit', (event) => {
    event.preventDefault()
    const data = parseInput('#form-image-search')
    $('#table-image-search').empty()
    $.ajax({
      method: 'POST',
      url: generateURL('imageAnime'),
      headers: { access_token: getStorage() },
      data,
    })
      .done((result) => {
        result.forEach((e) => {
          $('#table-image-search').append(tableImageSearch(e))
        })
      })
      .fail((error) => console.error(error))
  })

  $('[id*="anime-calculate-"]').on('click', (event) => {
    event.preventDefault()
    showOnly('#form-input')
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

  if (selector !== '#list-anime') return $(selector).show()
  $('#list-view-anime').empty()
  $.ajax({
    url: generateURL('anime'),
    headers: { access_token: localStorage[storageKey] },
  })
    .done((data) => {
      data.anime.forEach((anime) => {
        $('#list-view-anime').append(cardAnimeItem(anime))
        $(`#anime-calculate-${anime.index}`).on('click', (event) => {
          event.preventDefault()

          $('#form-input').empty()
          $('#form-input').append(bigCardAnime(anime))
          $('#form-episode-per-day').on('submit', (event) => {
            event.preventDefault()
            let { episodePerDay } = parseInput('#form-episode-per-day')
            let episodes = $('#anime-episodes').text()
            episodePerDay = +episodePerDay
            episodes = +episodes
            $('#list-calculation-date').empty()
            $.ajax({
              method: 'POST',
              url: generateURL('holidays'),
              headers: { access_token: getStorage() },
              data: { episodes, episodePerDay },
            })
              .done((result) => {
                result.data.forEach((e, i) => {
                  e.index = i + 1
                  $('#list-calculation-date').append(calculateDateItems(e))
                })
                showOnly('#calculation-date')
              })
              .fail((error) => console.error(error))
          })
          showOnly('#form-input')
        })
      })
    })
    .fail((error) => {
      console.error(error)
    })
    .always(() => $(selector).show())
}

function setStorage(key) {
  localStorage[storageKey] = key
}

function getStorage(key) {
  return localStorage[storageKey]
}

// modular components

function errorAlert(error) {
  return `
  <div class="alert alert-danger" role="alert">
    ${error}
  </div>
  `
}

function tableImageSearch(data) {
  return `<tr>
    <td>${data.anime}</td>
  </tr>`
}

function cardAnimeItem(anime) {
  return `<div class="col-12 col-md-6 col-lg-4">
    <div class="card">
      <img
        src="${anime.image_url}"
        style="height: 24rem; width:auto"
        class="card-img-top"
        alt=""
      />
      <div class="card-body">
        <h5 class="card-title text-truncate ">${anime.title}</h5>
        <h6>episode: ${anime.episodes}</h6>
        <h6>score: ${anime.score}</h6>
        <p class="card-text text-truncate ">
          ${anime.synopsis}
        </p>
        <div class="row">
        <div class="col"></div>
        <div class="col-auto">
          <a id="anime-calculate-${anime.index}" href="" class="btn btn-primary">
            Im busy, when can i watch?
          </a>
        </div>
        </div>
      </div>
    </div>
  </div>`
}

function bigCardAnime(anime) {
  return `<div class="container">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <img
            src="${anime.image_url}"
            style="height: 30rem"
            class="card-img-top"
            alt=""
          />
          <div class="card-body">
            <h5 class="card-title">${anime.title}</h5>
            <h6>episode: <span id="anime-episodes">${anime.episodes}</span></h6>
            <h6>score: ${anime.score}</h6>
            <p class="card-text">
              ${anime.synopsis}
            </p>
            <hr />
            <label for="">
              enter the number of episodes you will watch per day:
            </label>
            <form id="form-episode-per-day" method="POST">
              <div class="input-group mb-100 mx-auto">
                <input type="number" min="1" class="form-control" name="episodePerDay"/>
                <button type="submit" class="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>`
}

function calculateDateItems(holiday) {
  return `<tr>
    <th scope="row">${holiday.index}</th>
    <td>${holiday.name}</td>
    <td>${holiday.country}</td>
    <td>${new Date(holiday.date).toDateString()}</td>
  </tr>`
}

// helpers

const generateURL = (str) => apiURL + str

const errorHandler = (partial, error) => {
  $(`${partial} .error-message`).empty()
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

function onSignIn(googleUser) {
  let id_token = googleUser.getAuthResponse().id_token
  $.ajax({
    method: 'POST',
    url: generateURL('oauth'),
    data: {
      token: id_token,
    },
  })
    .done((response) => {
      console.log(response)
      localStorage.setItem(storageKey, response.access_token)
      showOnly('#list-anime')
    })
    .fail((err) => {
      console.log(err)
    })
}
