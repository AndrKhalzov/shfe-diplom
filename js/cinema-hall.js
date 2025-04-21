// общая инициализация 
let seansId = Number(localStorage.getItem("seanceId"));
let checkedData = localStorage.getItem("checkedDate");
const fullBody = document.querySelector("body");
const informaciyaPokupki = document.querySelector(".booking__info");
const filmName = document.querySelector(".booking__info_title");
const timeSeans = document.querySelector(".booking__info-time");
const nazvanieZala = document.querySelector(".booking__info_hall");
const shema = document.querySelector(".booking__scheme_places");
let shemaStrokiZala;
let placeZala;
const priceStandartZal = document.querySelector(".price_standart");
const cenaVipZala = document.querySelector(".price_vip");
let cenaStandart;
let priceVip;
let chosenPlaces;
let bilety = [];
let price;
const knopkaPokupki = document.querySelector(".booking__button");

// дабл клик для увеличения / уменьшения масштаба
fullBody.addEventListener("click", () => {
  const isTransformed = fullBody.getAttribute("transformed") === "true";
  if (Number(fullBody.getBoundingClientRect().width) < 1200) {
    fullBody.style.zoom = isTransformed ? "1" : "1.5";
    fullBody.style.transform = isTransformed ? "scale(1)" : "scale(1.5)";
    fullBody.style.transformOrigin = "0 0";
    fullBody.setAttribute("transformed", isTransformed ? "false" : "true");
  }
});

// установка информации о фильме / сеансе / зале
function ustanovitInformaciyu(data) {
  const indexSeansa = data.result.seances.findIndex(({ id }) => id === seansId);
  const seans = data.result.seances[indexSeansa];
  const indexFilma = data.result.films.findIndex(({ id }) => id === seans.seance_filmid);
  const indexZala = data.result.halls.findIndex(({ id }) => id === seans.seance_hallid);
  
  filmName.textContent = data.result.films[indexFilma].film_name;
  timeSeans.textContent = seans.seance_time;
  nazvanieZala.textContent = data.result.halls[indexZala].hall_name;

  // цена для стандартного / VIP мест
  priceStandartZal.textContent = data.result.halls[indexZala].hall_price_standart;
  cenaVipZala.textContent = data.result.halls[indexZala].hall_price_vip;
  cenaStandart = data.result.halls[indexZala].hall_price_standart;
  priceVip = data.result.halls[indexZala].hall_price_vip;
}

// показ схемы зала
function pokazatSkhemuZala(data) {
  const konfiguraciyaZala = data.result;
  konfiguraciyaZala.forEach(() => {
    shema.insertAdjacentHTML("beforeend", `<div class="booking__scheme_row"></div>`);
  });
  shemaStrokiZala = document.querySelectorAll(".booking__scheme_row");

  // Добавляем места в каждую строку
  shemaStrokiZala.forEach((row, i) => {
    konfiguraciyaZala[i].forEach(type => {
      row.insertAdjacentHTML("beforeend", `<span class="booking__scheme_chair" data-type="${type}"></span>`);
    });
  });
  placeZala = document.querySelectorAll(".booking__scheme_chair");

  // Присваиваем классы в зависимости от типа места
  placeZala.forEach(element => {
    const { type } = element.dataset;
    switch (type) {
      case "vip":
        element.classList.add("chair_vip");
        break;
      case "standart":
        element.classList.add("chair_standart");
        break;
      case "taken":
        element.classList.add("chair_occupied");
        break;
      default:
        element.classList.add("no-chair");
    }
  });
}

// выбор мест на схеме
function vybratMesta(shemaStrokiZala) {
  shemaStrokiZala.forEach(row => {
    Array.from(row.children).forEach(place => {
      if (place.dataset.type !== "disabled" && place.dataset.type !== "taken") {
        place.addEventListener("click", () => {
          place.classList.toggle("chair_selected");

          const selectedPlaces = document.querySelectorAll(".chair_selected:not(.booking__scheme_legend-chair)");
          knopkaPokupki.classList.toggle("booking__button_disabled", selectedPlaces.length === 0);
        });
      }
    });
  });
}

// обработка клика "Бронировать"
function klikKnopkiBronirovaniya() {
  knopkaPokupki.addEventListener("click", event => {
    event.preventDefault();
    // если кнопка неактивна
    if (knopkaPokupki.classList.contains("booking__button_disabled")) {
      return;
    }
    const vybrannyeStroki = Array.from(document.querySelectorAll(".booking__scheme_row"));
    bilety = []; // очищаем массив билетов

    // проходим по всем строкам и местам
    vybrannyeStroki.forEach((row, indexStroki) => {
      Array.from(row.children).forEach((place, indexMesta) => {
        if (place.classList.contains("chair_selected")) {
          price = place.dataset.type === "standart" ? cenaStandart : priceVip;
          bilety.push({
            row: indexStroki + 1,
            place: indexMesta + 1,
            coast: price,
          });
        }
      });
    });
    localStorage.setItem("tickets", JSON.stringify(bilety));
    document.location = "./payment-ticket.html";
  });
}

// получение данных с сервера
fetch("https://shfe-diplom.neto-server.ru/alldata")
  .then(response => response.json())
  .then(data => {
    console.log(data);
    ustanovitInformaciyu(data);

    // данные о конфигурации зала для конкретного сеанса
    fetch(`https://shfe-diplom.neto-server.ru/hallconfig?seanceId=${seansId}&date=${checkedData}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        pokazatSkhemuZala(data);
        vybratMesta(shemaStrokiZala);
        klikKnopkiBronirovaniya();
      });
  });
