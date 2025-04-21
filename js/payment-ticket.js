// общая инициализация 
let mesta = [];
let stoimost = [];
let konechnayaSumma;
const idSeansa = Number(localStorage.getItem("seanceId"));
const proverennayaData = localStorage.getItem("checkedDate");
const bilety = JSON.parse(localStorage.getItem("tickets"));
const knopkaBileta = document.querySelector(".btn--get-ticket");
const informaciyaFilma = document.querySelector(".payment__info-movie");
const informaciyaMest = document.querySelector(".payment__info-places");
const informaciyaZala = document.querySelector(".payment__info-hall");
const informaciyaVremeni = document.querySelector(".payment__info-time");
const informaciyaStoimosti = document.querySelector(".payment__info-price");

// получение информации о сеансе / фильме / зале / стоимости
function poluchitInformaciyu(data) {
  const indexSeansa = data.result.seances.findIndex(({ id }) => id === idSeansa);
  const seans = data.result.seances[indexSeansa];
  const indexFilma = data.result.films.findIndex(film => film.id === seans.seance_filmid);
  const indexZala = data.result.halls.findIndex(hall => hall.id === seans.seance_hallid);
  // фильм / зал /  время
  informaciyaFilma.textContent = data.result.films[indexFilma].film_name;
  informaciyaZala.textContent = data.result.halls[indexZala].hall_name;
  informaciyaVremeni.textContent = seans.seance_time;
  // места / стоимости билетов
  bilety.forEach(ticket => {
    mesta = [...mesta, `${ticket.row}/${ticket.place}`]; 
    stoimost = [...stoimost, ticket.coast]; 
  });
  informaciyaMest.textContent = mesta.join(", ");
  // вычисления итога стоимости
  konechnayaSumma = stoimost.reduce((acc, price) => acc + price, 0);
  informaciyaStoimosti.textContent = konechnayaSumma; 
}

// загрузка данных с сервера 
fetch("https://shfe-diplom.neto-server.ru/alldata")
  .then(response => response.json())
  .then(data => {
    console.log(data);
    poluchitInformaciyu(data);
  });

// обработчик клика по кнопке для получения билетов
knopkaBileta.addEventListener("click", e => {
  e.preventDefault(); 
  // FormData для отправки данных на сервер
  const params = new FormData();
  params.append("seanceId", idSeansa); 
  params.append("ticketDate", proverennayaData); 
  params.append("tickets", JSON.stringify(bilety)); 

  // отправка на сервер для бронирования билетов
  fetch("https://shfe-diplom.neto-server.ru/ticket", {
    method: "POST", 
    body: params 
  })
    .then(r => r.json())
    .then(data => {
      console.log(data);
      // если успешно то, сохраняем и перенаправляем
      if (data.success) {
        localStorage.setItem("ticketsInfo", JSON.stringify(data)); 
        window.location.href = "./ticket-information.html"; 
      } else {
        alert("Места недоступны для бронирования!"); 
      }
    });
});
