// общая инициализация
const knopkaVkhoda = document.querySelector(".btn--login");
const dniNavigacii = [...document.querySelectorAll(".date-nav__item")];
const navigaciyaSegodnya = document.querySelector(".date-nav__item--current");
const strelkaNavigaciiVpravo = document.querySelector(".date-nav__item--arrow");

let kolichestvoDney = 1;
let tekushayaNedelyaNavigacii, tekushayaDataNavigacii;
const dniNedeli = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const tekushiyDen = new Date(); // уст. сегодн. даты
let segodnyaDenNedeli, proverennayaData, vybrannayaData, vybrannyyMesyac, vybrannyyGod;
let poluchennayaData, poluchennyyMesyac, data;
let otsortirovannyeDniNavigacii;
let idSeansa;
const osnova = document.querySelector(".main-content");

let filmy, film, seansyFilma, spisokSeansovFilma;

// действия на вход в админку
knopkaVkhoda.onclick = e => {
  e.preventDefault();
  location.href = "adm-entrance.html";
};

function ustanovitSegodnya(d) {
  segodnyaDenNedeli = dniNedeli[d.getDay()];
  tekushayaNedelyaNavigacii = navigaciyaSegodnya.querySelector(".date-nav__weekday");
  tekushayaNedelyaNavigacii.textContent = `${segodnyaDenNedeli}, `;

  tekushayaDataNavigacii = navigaciyaSegodnya.querySelector(".date-nav__day");
  tekushayaDataNavigacii.textContent = ` ${d.getDate()}`;

  if (/Сб|Вс/.test(tekushayaNedelyaNavigacii.textContent)) {
    tekushayaNedelyaNavigacii.classList.add("date-nav__item--weekend");
    tekushayaDataNavigacii.classList.add("date-nav__item--weekend");
  }
}

function ustanovitDni() {
  dniNavigacii.forEach((day, i) => {
    if (!day.classList.contains("date-nav__item--current") && !day.classList.contains("date-nav__item--arrow")) {
      const d = new Date(tekushiyDen.getTime() + 86400000 * i);
      day.dataset.date = d.toISOString().split("T")[0];
      day.firstElementChild.textContent = `${dniNedeli[d.getDay()]},`;
      day.lastElementChild.textContent = d.getDate();
      day.classList.toggle("date-nav__item--weekend", /Сб|Вс/.test(day.firstElementChild.textContent));
    }
  });
}

function smenaDney(offset) {
  dniNavigacii.forEach((day, i) => {
    if (!day.classList.contains("date-nav__item--current") && !day.classList.contains("date-nav__item--arrow")) {
      const d = new Date(tekushiyDen.getTime() + 86400000 * (i + offset));
      day.dataset.date = d.toISOString().split("T")[0];
      day.firstElementChild.textContent = `${dniNedeli[d.getDay()]},`;
      day.lastElementChild.textContent = d.getDate();
      day.classList.toggle("date-nav__item--weekend", /Сб|Вс/.test(day.firstElementChild.textContent));
    }
  });
}

function poluchitDen(d, m, y) {
  poluchennayaData = d < 10 ? `0${d}` : d;
  poluchennyyMesyac = m < 10 ? `0${m}` : m;
  data = `${y}-${poluchennyyMesyac}-${poluchennayaData}`;
}

function sortirovkaDney(list) {
  otsortirovannyeDniNavigacii = list.filter(el => !el.classList.contains("date-nav__item--arrow"));
}

navigaciyaSegodnya.classList.add("date-nav__item--checked");
navigaciyaSegodnya.style.cursor = "default";
navigaciyaSegodnya.dataset.date = tekushiyDen.toISOString().split("T")[0];

if (navigaciyaSegodnya.classList.contains("date-nav__item--checked")) {
  vybrannayaData = tekushiyDen.getDate();
  vybrannyyMesyac = tekushiyDen.getMonth() + 1;
  vybrannyyGod = tekushiyDen.getFullYear();
  poluchitDen(vybrannayaData, vybrannyyMesyac, vybrannyyGod);
  localStorage.setItem("checkedDate", data);
}

ustanovitSegodnya(tekushiyDen);
ustanovitDni();
sortirovkaDney(dniNavigacii);
otmetitProshlyeSeansy();

strelkaNavigaciiVpravo.onclick = () => {
  kolichestvoDney++;

  navigaciyaSegodnya.classList.remove("date-nav__item--checked");
  navigaciyaSegodnya.classList.add("date-nav__item--arrow", "date-nav__item--left");
  navigaciyaSegodnya.style.cursor = "pointer";
  navigaciyaSegodnya.style.display = "flex";
  navigaciyaSegodnya.innerHTML = `<span class="date-nav__arrow">&lt;</span>`;

  smenaDney(kolichestvoDney);
  sortirovkaDney(dniNavigacii);
};

navigaciyaSegodnya.onclick = () => {
  if (!navigaciyaSegodnya.classList.contains("date-nav__item--arrow")) return;

  kolichestvoDney--;
  if (kolichestvoDney < 0) return;

  if (kolichestvoDney === 0) {
    navigaciyaSegodnya.classList.remove("date-nav__item--arrow", "date-nav__item--left");
    navigaciyaSegodnya.style.display = "block";
    navigaciyaSegodnya.innerHTML = `
      <span class="date-nav__today">Сегодня</span><br>
      <span class="date-nav__weekday"></span> <span class="date-nav__day"></span>
    `;


    ustanovitSegodnya(tekushiyDen);
    ustanovitDni();

    dniNavigacii.forEach(day => {
      if (!day.classList.contains("date-nav__item--checked")) {
        navigaciyaSegodnya.classList.add("date-nav__item--checked");
        navigaciyaSegodnya.style.cursor = "default";

        vybrannayaData = tekushiyDen.getDate();
        vybrannyyMesyac = tekushiyDen.getMonth() + 1;
        vybrannyyGod = tekushiyDen.getFullYear();
        poluchitDen(vybrannayaData, vybrannyyMesyac, vybrannyyGod);
        localStorage.setItem("checkedDate", data);
      }
    });
  } else {
    smenaDney(kolichestvoDney);
    sortirovkaDney(dniNavigacii);
  }
};

// выбрать день

otsortirovannyeDniNavigacii.forEach(day => {
  day.addEventListener("click", () => {
    otsortirovannyeDniNavigacii.forEach(el => {
      el.classList.remove("date-nav__item--checked");
      el.style.cursor = "pointer";
    });
    if (!day.classList.contains("date-nav__item--arrow")) {
      day.classList.add("date-nav__item--checked");
      day.style.cursor = "default";

      proverennayaData = new Date(day.dataset.date);
      vybrannayaData = proverennayaData.getDate();
      vybrannyyMesyac = proverennayaData.getMonth() + 1;
      vybrannyyGod = proverennayaData.getFullYear();

      poluchitDen(vybrannayaData, vybrannyyMesyac, vybrannyyGod);
      localStorage.setItem("checkedDate", data);

      otmetitProshlyeSeansy();
      klikSeansa();
    }
  });
});

let dannyeFilmy, dannyeSeansy, dannyeZaly, seansyZalov, tekushieSeansy;

function poluchitFilmy(data) {
  ({ films: dannyeFilmy, seances: dannyeSeansy, halls: dannyeZaly } = data.result);
  dannyeZaly = dannyeZaly.filter(z => z.hall_open);

  dannyeFilmy.forEach(film => {
    seansyZalov = "";

    dannyeZaly.forEach(hall => {
      tekushieSeansy = dannyeSeansy.filter(s =>
        +s.seance_hallid === +hall.id && +s.seance_filmid === +film.id
      ).sort((a, b) => a.seance_time.localeCompare(b.seance_time));

      if (tekushieSeansy.length > 0) {
        seansyZalov += `<h3 class="movie-seances__hall" data-hallid="${hall.id}">${hall.hall_name}</h3><ul class="movie-seances__list">`;
        tekushieSeansy.forEach(s => {
          seansyZalov += `<li class="movie-seances__time" data-seanceid="${s.id}" data-hallid="${hall.id}" data-filmid="${film.id}">${s.seance_time}</li>`;
        });
        seansyZalov += `</ul>`;
      }
    });

// секция с фильмами

    if (seansyZalov) {
      osnova.insertAdjacentHTML("beforeend", `
        <section class="movie" data-filmid="${film.id}">
          <div class="movie__info">
            <div class="movie__poster">
              <img src="${film.film_poster}" alt="Постер фильма ${film.film_name}" class="movie__poster_image">
            </div>
            <div class="movie__description">
              <h2 class="movie__title">${film.film_name}</h2>
              <p class="movie__synopsis">${film.film_description}</p>
              <p class="movie__data">
                <span class="movie__data-length">${film.film_duration} минут</span>
                <span class="movie__data-country">${film.film_origin}</span>
              </p>
            </div>
          </div>
          <div class="movie-seances">${seansyZalov}</div>
        </section>
      `);
    }
  });

  otmetitProshlyeSeansy();
  klikSeansa();
}

fetch("https://shfe-diplom.neto-server.ru/alldata")
  .then(r => r.json())
  .then(poluchitFilmy);

function otmetitProshlyeSeansy() {
  const h = tekushiyDen.getHours(), m = tekushiyDen.getMinutes();
  spisokSeansovFilma = document.querySelectorAll(".movie-seances__time");

  spisokSeansovFilma.forEach(seance => {
    const [hr, min] = seance.textContent.trim().split(":").map(Number);
    const sameDay = +vybrannayaData === tekushiyDen.getDate();

    if (sameDay && (h > hr || (h === hr && m > min))) {
      seance.classList.add("movie-seances__time--disabled");
    } else {
      seance.classList.remove("movie-seances__time--disabled");
    }
  });
}

// перейти в зал

function klikSeansa() {
  spisokSeansovFilma = document.querySelectorAll(".movie-seances__time");

  spisokSeansovFilma.forEach(seance => {
    if (!seance.classList.contains("movie-seances__time--disabled")) {
      seance.onclick = () => {
        idSeansa = seance.dataset.seanceid;
        localStorage.setItem("seanceId", idSeansa);
        location.href = "./cinema-hall.html";
      };
    }
  });
}
