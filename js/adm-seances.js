// общая инициализация
const popupDobavitSeans = document.querySelector(".popup--add-session");
const vyborSeansFilm = document.querySelector(".select__add-seance_movie");
const formaDobavitSeans = document.querySelector(".popup__form_add-seance");
const vyborSeansZal = document.querySelector(".select__add-seance_hall");
const vvodVremeniSeansa = document.querySelector(".add-seans__input_time");
const popupUdalitSeans = document.querySelector(".popup--remove-session");

const imageToRemove = document.createElement("img");
Object.assign(imageToRemove.style, {
  width: "110px",
  height: "136px",
  position: "absolute",
  zIndex: "1000",
});
imageToRemove.id = "image_to_remove";
imageToRemove.draggable = "false";
imageToRemove.classList.add("noselect");
imageToRemove.src =
  "https://img.freepik.com/free-psd/google-icon-isolated-3d-render-illustration_47987-9777.jpg?t=st=1744803239~exp=1744806839~hmac=66312f7fcd74b8accf7d7e9367df5291eb33030383afa8700369ce55f8dc32cf&w=1380";

let seansyRazresheny = false;
let deletedSeansy = [];
let filtorDeletedSeansov = [];

let timeSeansov;
let timeFilmov;

let chosenFilm;
let chosenZal;
let vybrannyeSeansy;
let vybrannyeDlyaUdalenia;
let vybrannyySeans;
let vybrannyyIdSeansa;
let vybrannyyVremya;
let vybrannyyIdZala;
let vybrannoeNazvaniyeFilma;

let startSeansa;
let endSeansa;
let currentTimeSeansa;
let currentStartSeansa;
let currentSeansStart;
let currentSeansEnd;

let otmenaSeansovFilmov;
let saveSeansovFilmov;
let knopkaOtmenySeansa;
let titleUdalitSeans;
let buttonUdalitSeans;
let buttonOtmenyUdalitSeans;

let ckeckIdZala;
let checkIdFilma;
let checkNazvaniyaFilma;
let checkProdolzhitelnostiFilma;
let checkVremeniSeansa;

let variantNameZala;
let variantNazvaniyaFilma;
let seansyZal;

function zagruzkaSeansov(data) {
  // Проходим по каждому таймлайну (залу)
  for (let i = 0; i < timeSeansov.length; i++) {
    const timeline = timeSeansov[i];
    while (timeline.firstChild) {
      timeline.removeChild(timeline.firstChild);
    }

    const hallId = +timeline.dataset.id;
    // отбираем сеансы, которые принадлежат этому залу
    const seances = data.result.seances.reduce((acc, seance) => {
      if (+seance.seance_hallid === hallId) acc.push(seance);
      return acc;
    }, []);
    // добавляем каждый сеанс в интерфейс
    for (let j = 0; j < seances.length; j++) {
      const seance = seances[j];
      // соответствующий фильм по ID
      const film = data.result.films.find(
        (f) => f.id === +seance.seance_filmid
      );
      if (film) {
        const seanceHtml = sozdatSeansHTML(seance, film);
        timeline.insertAdjacentHTML("beforeend", seanceHtml);
      }
    }
  }

  ustanovitFonFilma();
  pozitsiyaSeansa();

  if (!window.hasOwnProperty("__seanceResizeBound")) {
    window.addEventListener("resize", pozitsiyaSeansa);
    window.__seanceResizeBound = true;
  }

  // кнопка отмены изменений
  inicializirovatKnopkuOtmeny(data);
}

// создание HTML-блока сеанса
function sozdatSeansHTML(seance, film) {
  // основной контейнер для сеанса
  const obertka = document.createElement("div");
  obertka.className = "timeline__seances_movie";
  obertka.setAttribute("data-filmid", seance.seance_filmid);
  obertka.setAttribute("data-seanceid", seance.id);
  obertka.setAttribute("draggable", "true");

  // элемент для названия фильма
  const zagolovok = document.createElement("p");
  zagolovok.className = "timeline__seances_title";
  zagolovok.textContent = film.film_name;

  // элемент для времени начала сеанса
  const vremya = document.createElement("p");
  vremya.className = "timeline__movie_start";
  vremya.setAttribute("data-duration", film.film_duration);
  vremya.textContent = seance.seance_time;

  // заголовок и время внутрь основного контейнера
  obertka.appendChild(zagolovok);
  obertka.appendChild(vremya);

  return obertka.outerHTML;
}

// настройка кнопки отмены
function inicializirovatKnopkuOtmeny(data) {
  const otmenaSeansovFilmov = document.getElementById("btn-sessions-cancel");
  if (!otmenaSeansovFilmov) return;
  const obrabotchikOtmeny = function (event) {
    event.preventDefault();
    const neaktivna =
      otmenaSeansovFilmov.classList.contains("button--disabled");
    if (neaktivna) return;
    while (deletedSeansy.length) deletedSeansy.pop();
    while (filtorDeletedSeansov.length) filtorDeletedSeansov.pop();

    // повторная инициализация интерфейса
    zagruzkaSeansov(data);
    udalitSeans();

    // деактивация кнопки
    ["button--disabled"].forEach((cls) => {
      otmenaSeansovFilmov.classList.add(cls);
      saveSeansovFilmov.classList.add(cls);
    });
  };
  otmenaSeansovFilmov.addEventListener("click", obrabotchikOtmeny);
}

function ustanovitFonFilma() {
  const filmy = document.querySelectorAll(".movie-item");
  const informaciyaFilmy = [];
  // проходимся по каждому фильму и сохраняем его ID и номер фона
  for (const movie of filmy) {
    const fonFilma = (movie.className.match(/\d+/) || [])[0];
    if (!fonFilma) continue;
    // информация о фильме в виде объекта
    informaciyaFilmy.push({
      movieInfoId: movie.dataset.id,
      background: fonFilma,
    });
  }

  timeFilmov = [...document.querySelectorAll(".timeline__seances_movie")];
  console.log(timeFilmov);
  // назначение каждому сеансу соответствующий фон на основе ID фильма
  for (const seans of timeFilmov) {
    const filmId = Number(seans.dataset.filmid);

    // поиск объекта фильма с совпадающим ID
    const dannye = informaciyaFilmy.find(
      (item) => Number(item.movieInfoId) === filmId
    );
    if (dannye) {
      seans.classList.add(`background-${dannye.background}`);
    }
  }
}

let denVMinutakh = 24 * 60;
let nachaloSeansaFilma;
let prodolzhitelnostFilma;
let shirinaFilma;
let pozitsiyaSeansaFilma;

// вычисление позиции и ширины сеанса на временной шкале
function pozitsiyaSeansa() {
  for (const item of timeFilmov) {
    const seansStartElement = item.querySelector(".timeline__movie_start");
    if (!seansStartElement) continue;

    // извлекаем часы и минуты
    const [hoursStr, minutesStr] = seansStartElement.textContent.split(":", 2);
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // общее время начала в минутах
    const nachaloSeansaFilma = hours * 60 + minutes;

    // длительность фильма
    const prodolzhitelnostFilma = Number(seansStartElement.dataset.duration);
    const pozitsiyaSeansaFilma = (nachaloSeansaFilma / denVMinutakh) * 100;
    const shirinaFilma = (prodolzhitelnostFilma / denVMinutakh) * 100;

    // установка стиля расположения
    Object.assign(item.style, {
      left: `${pozitsiyaSeansaFilma}%`,
      width: `${shirinaFilma}%`,
    });

    // проверка нужно ли адаптировать стиль
    if (item.dataset.change === "true") {
      item.firstElementChild.style.fontSize = "10px";
      item.style.padding = "10px";
    }

    // адаптируем внешний вид
    const shirinaFilmaPx = item.getBoundingClientRect().width;
    if (shirinaFilmaPx < 40) {
      item.firstElementChild.style.fontSize = "8px";
      item.style.padding = "5px";
      item.dataset.change = "true";
    }
  }
}

// открытие popup сеанса
function otkritPopupSeansa(data) {
  const movieElements = document.querySelectorAll(".movie-item");
  const hallElements = document.querySelectorAll(".timeline__seances");
  let draggedElement = null;

  // обработчики drag-and-drop
  const dragStartHandler = (event) => {
    draggedElement = event.currentTarget;
    chosenFilm = draggedElement.dataset.id;
  };

  const dragEndHandler = () => {
    draggedElement = null;
  };

  const dropHandler = (event) => {
    event.preventDefault();
    if (!draggedElement) return;

    const targetHall = event.currentTarget;
    chosenZal = targetHall.dataset.id;

    //  popup
    popupDobavitSeans.classList.remove("popup--hidden");

    // очищаем и заполняем select
    fillSelectElements(data);
  };

  // назначение обработчиков
  movieElements.forEach((movie) => {
    movie.addEventListener("dragstart", dragStartHandler);
    movie.addEventListener("dragend", dragEndHandler);
  });

  hallElements.forEach((hall) => {
    hall.addEventListener("dragover", (e) => e.preventDefault());
    hall.addEventListener("drop", dropHandler);
  });

  // заполнения select элементов
  function fillSelectElements(data) {
    vyborSeansZal.innerHTML = "";
    vyborSeansFilm.innerHTML = "";
    formaDobavitSeans.reset();

    // select залов
    data.result.halls.forEach((hall) => {
      const option = document.createElement("option");
      option.className = "option_add-seance hall__name";
      option.dataset.id = hall.id;
      option.textContent = hall.hall_name;
      if (Number(hall.id) === Number(chosenZal)) {
        option.selected = true;
      }
      vyborSeansZal.appendChild(option);
    });

    //  select фильмов
    data.result.films.forEach((film) => {
      const option = document.createElement("option");
      option.className = "option_add-seance movie__name";
      option.dataset.id = film.id;
      option.dataset.duration = film.film_duration;
      option.textContent = film.film_name;
      if (Number(film.id) === Number(chosenFilm)) {
        option.selected = true;
      }
      vyborSeansFilm.appendChild(option);
    });

    variantNameZala = vyborSeansZal.querySelectorAll(".hall__name");
    variantNazvaniyaFilma = vyborSeansFilm.querySelectorAll(".movie__name");
  }
}

let proverennyeSeansy = [];
let submitHandlerInitialized = false;

function klikKnopkiDobavitSeans() {
  if (submitHandlerInitialized) return;
  submitHandlerInitialized = true;

  formaDobavitSeans.addEventListener("submit", (event) => {
    event.preventDefault();
    proverennyeSeansy.length = 0;

    // получаем, проверяем зал
    const proverkaZala = vyborSeansZal.value;
    ckeckIdZala = [...variantNameZala].find(
      (hallName) => hallName.textContent === proverkaZala
    )?.dataset.id;

    // получаем, проверяем фильм
    const proverkaFilma = vyborSeansFilm.value;
    const selectedMovie = [...variantNazvaniyaFilma].find(
      (movieName) => movieName.textContent === proverkaFilma
    );
    checkIdFilma = selectedMovie?.dataset.id;
    checkNazvaniyaFilma = proverkaFilma;
    checkProdolzhitelnostiFilma = selectedMovie?.dataset.duration;

    // получаем время сеанса и вычисляем
    checkVremeniSeansa = vvodVremeniSeansa.value;
    const vremyaSeansa = checkVremeniSeansa.split(":");
    startSeansa = Number(vremyaSeansa[0]) * 60 + Number(vremyaSeansa[1]);
    endSeansa = startSeansa + Number(checkProdolzhitelnostiFilma);

    // проверка предела 23:59
    const posledneeVremya = 23 * 60 + 59;
    console.log(
      `Start time: ${startSeansa}, End time: ${endSeansa}, Duration: ${checkProdolzhitelnostiFilma}`
    );
    if (endSeansa > posledneeVremya) {
      alert("Последний сеанс должен заканчиваться не позднее 23:59!");
      return;
    }

    // проверка на наличие конфликтов времени
    const timeline = [...document.querySelectorAll(".timeline__seances")].find(
      (t) => Number(t.dataset.id) === Number(ckeckIdZala)
    );

    const seansyZal = timeline
      ? timeline.querySelectorAll(".timeline__seances_movie")
      : [];

    let conflictFound = false;

    for (let seance of seansyZal) {
      const currentTimeSeansa = seance.lastElementChild.dataset.duration;
      const currentStartSeansa = seance.lastElementChild.textContent.split(":");
      const currentSeansStart =
        Number(currentStartSeansa[0]) * 60 + Number(currentStartSeansa[1]);
      const currentSeansEnd = currentSeansStart + Number(currentTimeSeansa);

      if (startSeansa < currentSeansEnd && endSeansa > currentSeansStart) {
        alert("Новый сеанс пересекается по времени с существующими!");
        conflictFound = true;
        break;
      }
    }

    if (!conflictFound) {
      popupDobavitSeans.classList.add("popup--hidden");
      dobavitNovyySeans();
    }
  });
}

function dobavitNovyySeans() {
  // включение кнопки после добавления сеанса
  enableActionButtons();
  // вставляем новый сеанс в соответствующий зал
  insertNewSeanceIntoHall();
  // обновляем расположение сеансов и фон фильма
  updateSeancePositionAndBackground();
}

// включение выключенных кнопок
function enableActionButtons() {
  const cancelBtn = document.getElementById("btn-sessions-cancel");
  const saveBtn = document.getElementById("btn-sessions-save");

  // переключаем состояние кнопок
  toggleButtonState(cancelBtn, false);
  toggleButtonState(saveBtn, false);
}

function toggleButtonState(button, isDisabled) {
  if (isDisabled) {
    button.classList.add("button--disabled");
  } else {
    button.classList.remove("button--disabled");
  }
}

// вставка нового сеанса в правильный зал
function insertNewSeanceIntoHall() {
  timeSeansov.forEach((timeline) => {
    if (isTimelineMatchingHall(timeline)) {
      insertSeanceToTimeline(timeline);
    }
  });
}

// совпадает ли временная шкала с выбранным залом
function isTimelineMatchingHall(timeline) {
  return Number(timeline.dataset.id) === Number(ckeckIdZala);
}

// вставка HTML-разметки нового сеанса в шкалу
function insertSeanceToTimeline(timeline) {
  timeline.insertAdjacentHTML(
    "beforeend",
    `
      <div class="timeline__seances_movie" data-filmid="${checkIdFilma}" data-seanceid="" draggable="true">
        <p class="timeline__seances_title">${checkNazvaniyaFilma}</p>
        <p class="timeline__movie_start" data-duration="${checkProdolzhitelnostiFilma}">${checkVremeniSeansa}</p>
      </div>
    `
  );
}

//  обновление расположения сеансов и фона фильма
function updateSeancePositionAndBackground() {
  timeFilmov = Array.from(
    document.querySelectorAll(".timeline__seances_movie")
  );

  // устанавливаем фон фильма
  ustanovitFonFilma();
  // обновляем позицию сеанса
  pozitsiyaSeansa();
  // удаляем старые сеансы
  udalitSeans();
}

function udalitSeans() {
  vybrannyeSeansy = document.querySelectorAll(".timeline__seances_movie");

  let vybrannyyElement;

  // подготовка данных при старте перетаскивания
  const podgotovitDannyeSeansa = (seance) => {
    vybrannyySeans = seance;
    vybrannyyVremya = seance.closest(".movie-seances__timeline");
    chosenFilm = seance.dataset.filmid;
    vybrannoeNazvaniyeFilma = seance.firstElementChild.textContent;
    vybrannyyIdZala = seance.parentElement.dataset.id;
    vybrannyeDlyaUdalenia = vybrannyyVremya.firstElementChild;
    vybrannyeDlyaUdalenia.classList.remove("hidden");
  };

  // подтверждения удаления
  const pokazatPopupUdaleniya = () => {
    popupUdalitSeans.classList.remove("popup--hidden");

    titleUdalitSeans = document.querySelector(".popup__movie-title");
    titleUdalitSeans.textContent = vybrannoeNazvaniyeFilma;

    buttonUdalitSeans = document.querySelector(
      ".popup__remove-seance_button_delete"
    );
    buttonUdalitSeans.addEventListener("click", udalitSeansIzDom);
  };

  // удаление сеанса / обновление кнопок
  const udalitSeansIzDom = (e) => {
    e.preventDefault();
    popupUdalitSeans.classList.add("popup--hidden");

    if (vybrannyySeans.dataset.seanceid !== "") {
      vybrannyyIdSeansa = vybrannyySeans.dataset.seanceid;
      deletedSeansy.push(vybrannyyIdSeansa);
    }

    vybrannyySeans.remove();

    // убираем дубли
    filtorDeletedSeansov = [...new Set(deletedSeansy)];

    const hasDeleted = filtorDeletedSeansov.length > 0;
    otmenaSeansovFilmov.classList.toggle("button--disabled", !hasDeleted);
    saveSeansovFilmov.classList.toggle("button--disabled", !hasDeleted);
  };

  // назначение обработчиков перетаскивания
  const privyazatObrabotchikiSeansa = (seance) => {
    seance.addEventListener("dragstart", (event) => {
      vybrannyyElement = event.target;
      podgotovitDannyeSeansa(seance);

      vybrannyeDlyaUdalenia.addEventListener("dragover", (e) =>
        e.preventDefault()
      );
      vybrannyeDlyaUdalenia.addEventListener("drop", (e) => {
        e.preventDefault();
        pokazatPopupUdaleniya();
      });
    });

    seance.addEventListener("dragend", () => {
      vybrannyyElement = undefined;
      if (vybrannyeDlyaUdalenia) {
        vybrannyeDlyaUdalenia.classList.add("hidden");
      }
    });
  };

  vybrannyeSeansy.forEach(privyazatObrabotchikiSeansa);
}

function operaciiSeansov(information) {
  const timelinesWrapper = document.querySelector(".sessions-timeline");

  if (!timelinesWrapper) {
    console.warn("Контейнер для сеансов не найден");
    return;
  }

  timelinesWrapper.innerHTML = "";

  const halls = information.result.halls;

  halls.forEach((hall) => {
    const section = document.createElement("section");
    section.classList.add("movie-seances__timeline");

    section.innerHTML = `
      <div class="session-timeline__delete">
        <img src="./img/trash.png" alt="Удалить сеанс">
      </div>
      <h3 class="timeline__hall_title">${hall.hall_name}</h3>
      <div class="timeline__seances" data-id="${hall.id}"></div>
    `;

    timelinesWrapper.appendChild(section);
  });

  const elements = {
    timelines: document.querySelectorAll("[class*='timeline__seances']"),
    cancelBtn: document.querySelector("#btn-sessions-cancel"),
    saveBtn: document.querySelector("#btn-sessions-save"),
  };

  if (!elements.cancelBtn || !elements.saveBtn) {
    console.warn("Элементы управления не обнаружены");
    return void 0;
  }

  timeSeansov = elements.timelines;
  otmenaSeansovFilmov = elements.cancelBtn;
  saveSeansovFilmov = elements.saveBtn;

  // поведение
  const operations = [
    () => zagruzkaSeansov(information),
    () => otkritPopupSeansa(information),
    () => klikKnopkiDobavitSeans(),
    () => udalitSeans(),
  ];

  operations.forEach((action) => {
    try {
      action();
    } catch (e) {
      console.warn("Операция выполнена с отклонениями", e);
    }
  });

  [otmenaSeansovFilmov, saveSeansovFilmov].forEach((control) => {
    control.classList.toggle("button--disabled", true);
  });
}
saveSeansovFilmov = document.getElementById("btn-sessions-save");
saveSeansovFilmov.addEventListener("click", handleSaveSeances);

async function handleSaveSeances(event) {
  event.preventDefault();
  if (saveSeansovFilmov.classList.contains("button-disabled")) return;

  // получаем все сеансы
  const allSeances = getSeances();
  processNewSeances(allSeances);
  processDeletedSeances(filtorDeletedSeansov);

  // уведомление и перезагрузка страницы
  alert("Сеансы сохранены!");
  const updatedData = await poluchitDannye(false);
  if (updatedData) operaciiSeansov(updatedData);
}

// получение всех сеансов с временной шкалы
function getSeances() {
  return Array.from(document.querySelectorAll(".timeline__seances_movie"));
}

// обработка сеансов, которые нужно добавить
function processNewSeances(seances) {
  seances.forEach((seance) => {
    if (seance.dataset.seanceid === "") {
      const seanceParams = createSeanceParams(seance);
      dobavitSeans(seanceParams);
    }
  });
}

// параметры для нового сеанса
function createSeanceParams(seance) {
  const params = new FormData();
  params.set("seanceHallid", seance.parentElement.dataset.id);
  params.set("seanceFilmid", seance.dataset.filmid);
  params.set(
    "seanceTime",
    seance.querySelector(".timeline__movie_start").textContent
  );
  return params;
}

// обрабатка удаленных сеансов
function processDeletedSeances(deletedSeans) {
  if (deletedSeans.length === 0) return;
  deletedSeans.forEach((seance) => {
    udalitSeansy(seance);
  });
}

// перезагрузка страницы
function reloadPage() {
  location.reload();
}

function dobavitSeans(params) {
  fetch("https://shfe-diplom.neto-server.ru/seance", {
    method: "POST",
    body: params,
  })
    .then((response) => response.json())
    .then(function (data) {
      console.log(data);
    });
}

function udalitSeansy(seanceId) {
  fetch(`https://shfe-diplom.neto-server.ru/seance/${seanceId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then(function (data) {
      console.log(data);
    });
}
