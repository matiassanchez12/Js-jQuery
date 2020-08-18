/*
const noCambia = "Leonidas";

let cambia = "@LeonidasEsteban"

function cambiarNombre(nuevoNombre) {
  cambia = nuevoNombre
}

const getUser = new Promise(function(todoBien, todoMal) {
  // llamar a un api
  setTimeout(function() {
    // luego de 3 segundos
    todoBien('se acabo el tiempo');
  }, 3000)
})

const getUserAll = new Promise(function(todoBien, todoMal) {
  // llamar a un api
  setTimeout(function() {
    // luego de 3 segundos
    todoMal('no se acabo el tiempo');
  }, 3000)
})

  Promise.all([
    getUser,
    getUserAll,
  ])

  .then(function(msg){
    console.log(msg);
  })
  .catch(function(msg){
    console.log(msg);
  })

  $.ajax('https://randomuser.me/api/',{
    method: 'GET',
    success: function(data) {
      console.log(data);
    },
    error: function(error) {
      console.log(error);
    }
  })
  
  fetch('https://randomuser.me/api/')
    .then(function(response){
      return response.json() 
    })
    .then(function(user){
      console.log('user', user.results[0].name.first)
    })
    .catch(function(){
      console.log('algo fallo')
    })
  */

(async function load() {

  //!FUNCION PARA TOMAR DATOS DE UN URL
  async function getData(url) {
    const response = await fetch(url);
    const data = await response.json();

    if (data.data.movie_count > 0) {
      return data;
    }

    throw new Error('No se encontro resultados.');
  }

  async function getDataPersons(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  //* SELECTORES!
  const $form = document.getElementById('form');
  const $home = document.getElementById('home');
  const $featuringContainer = document.querySelector("#featuring");

  //! *FUNCION PARA CREAR UN - TEMPLATE - DEL CUADRO PELICULA ENCONTRADA
  function featuringTemplate(movie) {
    return (
      `<div class="featuring">
      <div class="featuring-image">
        <img src="${movie.medium_cover_image}" width="70" height="100" alt="">
      </div>
      <div class="featuring-content">
        <p class="featuring-title">Pelicula encontrada</p>
        <p class="featuring-album">"${movie.title}"</p>
      </div>
     </div>`
    )
  }

  const BASE_API = "https://yts.mx/api/v2/";

  //! *FUNCION PARA SETEAR ATRIBUTOS CON " FOR - IN "

  function setAttributes($element, attributes) {
    for (const attribute in attributes) {
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }

  //! TRABAJO CON EL FORMULARIO
  $form.addEventListener('submit', async (event) => {
    event.preventDefault();

    $home.classList.add('search-active');

    const $loader = document.createElement("img");
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50,
    })

    $featuringContainer.append($loader);

    const data = new FormData($form);
    try {
      const { data: { movies: pelis }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`);

      const HTMLStringFeaturing = featuringTemplate(pelis[0]);
      $featuringContainer.innerHTML = HTMLStringFeaturing;
    } catch (error) {
      alert(error.message);
      $loader.remove();
      $home.classList.remove('search-active');
    }
  })

  //! FUNCION : "Devuelve el codigo de una pelicula- la IMG y el TITLE"

  function videoItemTemplate(movie) {
    const funcFind = (element) => element === "Drama" || element === "Action" || element === "Animation";
    let indexGenre = movie.genres.findIndex(funcFind);
    return (
      `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${movie.genres[indexGenre]}">
    <div class="primaryPlaylistItem-image">
      <img src= "${movie.medium_cover_image}">
    </div>
    <h4 class="primaryPlaylistItem-title">
      ${movie.title}
    </h4>
    </div>`
    )
  }

  //!FUNCION : "Devuelve una nueva estructura HTML y recibe el codigo de una pelicula"

  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  //!FUNCION: "renderMovieList-hacerListadoDePeliculas-
  //!             1)Crea un codigo HTML para cada pelicula
  //!             2)Crea una estructura HTML para cada pelicula(con el formato tipo caja : div, titulo y parrafo)
  //!             3)Agrega al final de un contenedor (accion-drama-animacion) un children (osea el div) de la estructura HTML"


  function renderMovieList(list, $container) {

    $container.children[0].remove();
    list.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);

      const imageElement = movieElement.querySelector('img');

      addEventFadeIn(imageElement);
      addEventClick(movieElement);

    })
  }

  //*CREO MIS 3 LISTADOS DE PELICULAS - UNO POR CADA TIPO -

  async function confirmExistCache(category){
    const listName = `${category}List`;
    const cacheList = localStorage.getItem(listName);

    if(cacheList){
      return JSON.parse(cacheList);
    }

    const { data: { movies: ActionList } } = await getData(`${BASE_API}list_movies.json?genre=${category}`)
    return ActionList;
  }

  const ActionList = await confirmExistCache("action")
  const $actionContainer = document.querySelector("#action");
  renderMovieList(ActionList, $actionContainer);

  const DramaList = await confirmExistCache("drama")
  const $dramaContainer = document.getElementById("drama");
  renderMovieList(DramaList, $dramaContainer);

  const AnimationList = await confirmExistCache("animation")
  const $animationContainer = document.getElementById("animation");
  renderMovieList(AnimationList, $animationContainer);

  
  const AdventureList = await confirmExistCache("adventure")

  //*SELECTORES

  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');

  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');


  function setIdMovie(list, movieList) {
    for (let i = 0; i < list.length; i++) {
      list[i].setAttribute("id", movieList[i].id);

      const listMovieTitle = list[i].querySelector("span");
      listMovieTitle.textContent = movieList[i].title;

      addEventClickPlayList(list[i], movieList[i]);
    }
  }

  function addEventClickPlayList($element) {
    $element.addEventListener('click', () => {
      showModalPlayList($element);
    })
  }

  function showModalPlayList($element) {
    $modal.style.animation = 'modalIn .8s forwards';
    const idMovie = $element.id;

    let dataMovie;

    dataMovie = findById(AdventureList, idMovie);
    
    $modalTitle.textContent = dataMovie.title;
    $modalImage.setAttribute('src', dataMovie.medium_cover_image);
    $modalDescription.textContent = dataMovie.description_full;
  }
  
  const $playListName = document.getElementsByClassName("myPlaylist-item");
  setIdMovie($playListName, AdventureList);

  async function setDataPerson(list) {
    for (let i = 0; i < list.length; i++) {
      
      let onePerson = await getDataPersons("https://randomuser.me/api");
      list[i].setAttribute("name", onePerson.results[0].name.first );
     
      const listNameElement = list[i].querySelector("span");
      const imageElement = list[i].querySelector("img");
      const name = onePerson.results[0].name.first;
      const lastName = onePerson.results[0].name.last;

      listNameElement.textContent = name + " " + lastName;
      imageElement.setAttribute('src', onePerson.results[0].picture.medium);

      addEventClickListFriends(list[i],onePerson);
    }
  }

  function addEventClickListFriends($element, $person) {
    $element.addEventListener('click', () => {
      showModalListFriends($element, $person);
    })
  }

  function showModalListFriends($element, $person) {
    $modal.style.animation = 'modalIn .8s forwards';
  
    const name = $person.results[0].name.first;
    const lastName = $person.results[0].name.last;

    $modalTitle.textContent = name + " " + lastName;
    $modalImage.setAttribute('src', $person.results[0].picture.large);
    $modalDescription.textContent = $person.results[0].email;
  }

  const $playListFriends = document.getElementsByClassName("playlistFriends-item");
  setDataPerson($playListFriends);



  //!FUNCION : "AddeventFadeIn generar un efecto de mostrado progresivo en el momento del listado de pelis"

  function addEventFadeIn($element) {
    $element.addEventListener('load', (event) => {
      event.target.classList.add('fadeIn');
    })
  }

  //!FUNCION : "AddeventClick sirve para agregar un evento a un elemento, aca es un click"

  function addEventClick($element) {
    $element.addEventListener('click', () => {
      showModal($element);
    })
  }

  //! FUNCION PARA BUSCAR PELICULA POR ID
  function findById(list, id) {
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  //! TRABAJO CON EL MODAL -cuadro de dialogo cuando clickeamos una pelicula-
  function showModal($element) {
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';

    const idMovie = $element.dataset.id;
    const categoryMovie = $element.dataset.category;

    let dataMovie;
    console.log(categoryMovie);
    switch (categoryMovie) {
      case 'Action':
        dataMovie = findById(ActionList, idMovie);
        break;
      case 'Drama':
        dataMovie = findById(DramaList, idMovie);
        break;
      case 'Animation':
        dataMovie = findById(AnimationList, idMovie);
        break;
    }

    $modalTitle.textContent = dataMovie.title;
    $modalImage.setAttribute('src', dataMovie.medium_cover_image);
    $modalDescription.textContent = dataMovie.description_full;

  }

  //! ESCONDER EL MODAL
  function hideModal() {
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';
  }

  $hideModal.addEventListener('click', hideModal);

})()

