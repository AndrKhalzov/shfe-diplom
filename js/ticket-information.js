// общая инициализация
const proverennayaData = localStorage.getItem("checkedDate");
const idSeansa = Number(localStorage.getItem("seanceId"));
const bilety = JSON.parse(localStorage.getItem("tickets"));
const informaciyaBiletov = JSON.parse(localStorage.getItem("ticketsInfo"));
const qrKodBileta = document.querySelector(".payment__info-qr");
const informaciyaFilma = document.querySelector(".payment__info-movie");
const informaciyaMest = document.querySelector(".payment__info-places");
const informaciyaZala = document.querySelector(".payment__info-hall");
const informaciyaVremeni = document.querySelector(".payment__info-time");
let kodQr, tekstQr;
let mesta = [];
let stoimost = [];
let konechnayaSumma;

// получение / обработка информации о сеансе
function getSeanceInfo(seanceData) {
  const seanceIndex = findSeanceIndex(seanceData, idSeansa);
  const filmIndex = findFilmIndex(seanceData, seanceData.result.seances[seanceIndex].seance_filmid);
  const hallIndex = findHallIndex(seanceData, seanceData.result.seances[seanceIndex].seance_hallid);

  updateUI(seanceData, seanceIndex, filmIndex, hallIndex);
  generateTicketSummary();
  generateQRCode();
}

// поиск индекса сеанса по ID
function findSeanceIndex(data, seanceId) {
  return data.result.seances.findIndex(seance => seance.id === seanceId);
}

// поиск индекса фильма по ID
function findFilmIndex(data, filmId) {
  return data.result.films.findIndex(film => film.id === filmId);
}

// поиск индекса зала 
function findHallIndex(data, hallId) {
  return data.result.halls.findIndex(hall => hall.id === hallId);
}

//  обновления UI
function updateUI(data, seanceIndex, filmIndex, hallIndex) {
  informaciyaFilma.textContent = data.result.films[filmIndex].film_name;
  informaciyaZala.textContent = data.result.halls[hallIndex].hall_name;
  informaciyaVremeni.textContent = data.result.seances[seanceIndex].seance_time;

  bilety.forEach(bilet => {
    mesta.push(`${bilet.row}/${bilet.place}`);
    stoimost.push(bilet.coast);
  });

  informaciyaMest.textContent = mesta.join(", ");
}

// генерация итоговой стоимости билетов
function generateTicketSummary() {
  konechnayaSumma = stoimost.reduce((acc, price) => acc + price, 0);
}

// формирование текста для QR кода
function generateQRCode() {
  tekstQr = `
    Дата: ${proverennayaData}, 
    Время: ${informaciyaVremeni.textContent}, 
    Название фильма: ${informaciyaFilma.textContent}, 
    Зал: ${informaciyaZala.textContent}, 
    Ряд/Место: ${mesta.join(", ")}, 
    Стоимость: ${konechnayaSumma}, 
    Билет действителен строго на свой сеанс
  `;

  kodQr = QRCreator(tekstQr, {
    mode: -1,
    eccl: 0,
    version: -1,
    mask: -1,
    image: "PNG",
    modsize: 3,
    margin: 3
  });

  qrKodBileta.append(kodQr.result);
  localStorage.clear();
}

// запрос данных с сервера
fetch("https://shfe-diplom.neto-server.ru/alldata")
  .then(response => response.json())
  .then(data => {
    console.log(data);
    getSeanceInfo(data); 
  });
