// общая инициализация
const zalyButton = document.querySelector(".button--hall");
let zalyUdalitKnopka;
const zalyList = document.querySelector(".halls-list");
const infoZaly = document.querySelector(".admin-section__info");

let zalyKonfigMassiv = [];
let zalyKonfigElements;
const zalyKonfigObertka = document.querySelector(".hall-config");
const zalyKonfigList = document.querySelector(".hall-config__list");
const zalyKonfig = document.querySelector(".admin-section--hall-config");

let currentZalKonfig;
let currentZalKonfigIndex;
let newZalKonfigMassiv;

let formaZalKonfig;
let strZalKonfig;
let placesZalKonfig;
let skhemaZal;
let strSkhemaZal;
let placesSkhemaZal;
let kreslaZal;
let cancelZalKonfig;
let saveZalKonfig;

let tekushayaCenaKonfiguraciya;
const priceKonfigList = document.querySelector(".price-config__list");
let priceKonfigElements;
const cenaKonfiguraciyaObertka = document.querySelector(".price-config");
const priceKonfig = document.querySelector(".admin-section--prices");
formaPriceKonfig = document.querySelector(".price-config__form");
const priceInputs = document.querySelectorAll(".price-config__input");
priceStandartKonfig = priceInputs[0];
priceVipKonfig = priceInputs[1];
otmenaCenaKonfiguraciya = document.querySelector(".price-config__batton_cancel");
savePriceKonfig = document.querySelector(".price-config__batton_save");

const openProdazhu = document.querySelector(".admin-section--sales");
const listOpenProdazhu = document.querySelector(".sales__list");
const obertkaOpenProdazhu = document.querySelector(".sales-control");
let infoOpenProdazhu;
let knopkaOpenProdazhu;
let tekushayaOpenProdazhu;

let tekushiyStatusZal;
let noviyStatusZal;

const seansyFilmovVremya = document.querySelector(".sessions-timeline");
let udaleniyaVremya;

function proverkaSpisokZalov() {
  const vidimyeElementy = [
    infoZaly,
    zalyList,
    zalyKonfig,
    seansyFilmovVremya,
    openProdazhu,
  ];

  const deystvie = zalyList.innerText.trim() ? 'remove' : 'add';

  // применяем нужное действие (скрыть / удалить) ко всем элементам
  vidimyeElementy.forEach((el) => el.classList[deystvie]("hidden"));
}

zalyButton.addEventListener("click", () => {
  popupDobavitZal.classList.remove("popup--hidden");
});

const popupDobavitZal = document.querySelector(".popup--add-hall");
const formaDobavitZal = document.querySelector(".popup__form");
const vvodDobavitZal = document.querySelector(".popup__input");
const knopkaDobavitZal = document.querySelector(".button--confirm");

formaDobavitZal.addEventListener("submit", (e) => {
  e.preventDefault();
  processForm(vvodDobavitZal);
});

// функция для обработки добавления зала
function processForm(inputField) {
  const hallName = inputField.value.trim();
  if (hallName) {
    sendData(hallName).then((data) => {
      if (data && data.result && data.result.halls) {
        addHallToList(data.result.halls.id, hallName);
        resetForm(inputField);
      }
    });
  }
}

// отправка данных на сервер
async function sendData(hallName) {
  const formData = new FormData();
  formData.set("hallName", hallName);
  try {
    const response = await fetch("https://shfe-diplom.neto-server.ru/hall", {
      method: "POST",
      body: formData,
    });

    return response.json();
  } catch (error) {
    console.error("Error during fetch:", error);
  }
}

// добавление зала в список
function addHallToList(hallId, hallName) {
  zalyList.insertAdjacentHTML(
    "beforeend",
    `
    <li class="halls-list__item">
      <span class="halls-list__name" data-id="${hallId}">${hallName}</span>
      <span class="button--remove hall_remove"></span>
    </li>
  `
  );
}

// сброс формы
function resetForm(inputField) {
  inputField.value = "";
  location.reload();
}

function udalitZal(hallId) {
  fetch(`https://shfe-diplom.neto-server.ru/hall/${hallId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then(function (data) {
      console.log(data);
      location.reload();
    });
}

function pokazatZal(data, currentZalKonfigIndex) {
  if (!data || !data.result || !data.result.halls || !Array.isArray(data.result.halls[currentZalKonfigIndex].hall_config)) {
    console.error("Ошибка: halls или hall_config не существуют или имеют неверный формат");
    return;
  }

  const hall = data.result.halls[currentZalKonfigIndex];

  strZalKonfig.value = hall.hall_rows;
  placesZalKonfig.value = hall.hall_places;

  skhemaZal.innerHTML = "";
  zalyKonfigMassiv = [];

  if (Array.isArray(hall.hall_config)) {
    hall.hall_config.forEach(() => {
      skhemaZal.insertAdjacentHTML("beforeend", `<div class="hall-config__row"></div>`);
    });
  }

  // элементы схемы зала
  strSkhemaZal = document.querySelectorAll(".hall-config__row");

  for (let i = 0; i < strSkhemaZal.length; i++) {
    for (let j = 0; j < hall.hall_config[0].length; j++) {
      strSkhemaZal[i].insertAdjacentHTML(
        "beforeend",
        `<span class="seat" data-type="${hall.hall_config[i][j]}"></span>`
      );
    }
  }

  // присваиваем классы местам
  kreslaZal = document.querySelectorAll(".hall-config__row .seat");

  kreslaZal.forEach((element) => {
    if (element.dataset.type === "vip") {
      element.classList.add("seat--vip");
    } else if (element.dataset.type === "standart") {
      element.classList.add("seat--standard");
    } else {
      element.classList.add("seat--blocked");
    }
  });

  // сохраняем конфигурацию зала
  zalyKonfigMassiv = JSON.parse(JSON.stringify(hall.hall_config));
}

function izmenitMesta(strSkhemaZal, data) {
  newZalKonfigMassiv = JSON.parse(JSON.stringify(zalyKonfigMassiv));
  const izmenitStroki = Array.from(strSkhemaZal);

  izmenitStroki.forEach((row, rowIndex) => {
    Array.from(row.children).forEach((place, placeIndex) => {
      place.style.cursor = "pointer";

      // обработчик клика на месте
      place.addEventListener("click", () => {
        // переключаем состояние места 
        if (place.classList.contains("seat--standard")) {
          place.classList.replace("seat--standard", "seat--vip");
          place.dataset.type = "vip";
          newZalKonfigMassiv[rowIndex][placeIndex] = "vip";
        } else if (place.classList.contains("seat--vip")) {
          place.classList.replace("seat--vip", "seat--blocked");
          place.dataset.type = "disabled";
          newZalKonfigMassiv[rowIndex][placeIndex] = "disabled";
        } else {
          place.classList.replace("seat--blocked", "seat--standard");
          place.dataset.type = "standart";
          newZalKonfigMassiv[rowIndex][placeIndex] = "standart";
        }

        // конфигурация зала с новым состоянием
        const isConfigChanged = JSON.stringify(newZalKonfigMassiv) !== JSON.stringify(data.result.halls[currentZalKonfigIndex].hall_config);
        if (isConfigChanged) {
          cancelZalKonfig.classList.remove("button--disabled");
          saveZalKonfig.classList.remove("button--disabled");
        } else {
          cancelZalKonfig.classList.add("button--disabled");
          saveZalKonfig.classList.add("button--disabled");
        }
      });
    });
  });
}

function izmenitRazmerZala(newZalKonfigMassiv, data) {
  // обработчик для изменения размера зала
  const handleInput = () => {
    newZalKonfigMassiv.length = 0;
    skhemaZal.innerHTML = "";

    const rowCount = Number(strZalKonfig.value);
    for (let i = 0; i < rowCount; i++) {
      skhemaZal.insertAdjacentHTML("beforeend", `<div class="hall-config__row"></div>`);
      newZalKonfigMassiv.push([]);
    }

    const strSkhemaZal = Array.from(document.querySelectorAll(".hall-config__row"));
    const seatCount = Number(placesZalKonfig.value);

    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < seatCount; j++) {
        strSkhemaZal[i].insertAdjacentHTML("beforeend", `<span class="seat seat--standard" data-type="standart"></span>`);
        newZalKonfigMassiv[i].push("standart");
      }
    }

    // сравниваем текущую конфигурацию с новой
    const isConfigChanged = JSON.stringify(newZalKonfigMassiv) !== JSON.stringify(data.result.halls[currentZalKonfigIndex].hall_config);

    // активируем или деактивируем кнопки
    cancelZalKonfig.classList.toggle("button--disabled", !isConfigChanged);
    saveZalKonfig.classList.toggle("button--disabled", !isConfigChanged);

    izmenitMesta(strSkhemaZal, data);
  };

  // обработчик на изменение
  formaZalKonfig.addEventListener("input", handleInput);
}

async function sohranitKonfiguraciyu(currentZalKonfig, newZalKonfigMassiv) {
  try {
    const params = new FormData();
    params.append("rowCount", strZalKonfig.value);
    params.append("placeCount", placesZalKonfig.value);
    params.append("config", JSON.stringify(newZalKonfigMassiv));

    const response = await fetch(
      `https://shfe-diplom.neto-server.ru/hall/${currentZalKonfig}`,
      {
        method: "POST",
        body: params,
      }
    );

    // если ответ не успешен, выбрасываем ошибку
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);

    alert("Конфигурация зала сохранена!");
    location.reload();
  } catch (error) {
    console.error("Ошибка при сохранении конфигурации: ", error);
    alert("Произошла ошибка при сохранении конфигурации.");
  }
}

function pokazatCeny(apiData, currentConfigId) {
  const initPriceControls = () => {
    const controls = {
      form: document.querySelector('.price-config__form'),
      inputs: [...document.querySelectorAll('.price-config__input')],
      cancelBtn: document.querySelector('.price-config__controls .button--cancel'),
      saveBtn: document.querySelector('.price-config__controls .button--save')
    };

    if (!controls.form || controls.inputs.length < 2) {
      console.warn('Элементы управления ценами не найдены');
      return null;
    }
    return controls;
  };

  // поиск конфигурации зала
  const findHallConfig = (hallId) => {
    return apiData?.result?.halls?.find(hall =>
      hall.id === Number(hallId)
    );
  };

  // обновление формы цен
  const refreshPriceForm = (formElement) => {
    const newForm = formElement.cloneNode(true);
    formElement.parentNode.replaceChild(newForm, formElement);
    return {
      form: newForm,
      inputs: newForm.querySelectorAll('.price-config__input')
    };
  };

  // настройка обработчика изменений
  const setupChangeHandler = (form, inputs, originalPrices) => {
    form.addEventListener('input', () => {
      const hasChanges =
        inputs[0].value != originalPrices.standart ||
        inputs[1].value != originalPrices.vip;

      controls.cancelBtn?.classList.toggle('button--disabled', !hasChanges);
      controls.saveBtn?.classList.toggle('button--disabled', !hasChanges);
    });
  };

  // основной поток выполнения
  const controls = initPriceControls();
  if (!controls) return;

  const hallConfig = findHallConfig(currentConfigId);
  if (!hallConfig) return;

  // цстановка значений цен
  controls.inputs[0].value = hallConfig.hall_price_standart || '';
  controls.inputs[1].value = hallConfig.hall_price_vip || '';

  // обновление формы
  const { form, inputs } = refreshPriceForm(controls.form);

  // экспорт в глобальную область
  priceStandartKonfig = inputs[0];
  priceVipKonfig = inputs[1];
  formaPriceKonfig = form;
  otmenaCenaKonfiguraciya = controls.cancelBtn;
  savePriceKonfig = controls.saveBtn;

  // настройка обработчиков
  setupChangeHandler(
    form,
    inputs,
    {
      standart: hallConfig.hall_price_standart,
      vip: hallConfig.hall_price_vip
    }
  );
}
function createFormData() {
  const formData = new FormData();
  formData.set("priceStandart", `${priceStandartKonfig.value}`);
  formData.set("priceVip", `${priceVipKonfig.value}`);
  return formData;
}

function handleResponse(response) {
  return response.json().then((data) => {
    console.log(data);
    alert("Конфигурация цен сохранена!");
    location.reload();
  });
}

function handleError(error) {
  console.error("Произошла ошибка при сохранении цен:", error);
  alert("Ошибка при сохранении конфигурации цен. Попробуйте позже.");
}

function sohranitCeny(tekushayaCenaKonfiguraciya) {
  const params = createFormData();
  fetch(
    `https://shfe-diplom.neto-server.ru/price/${tekushayaCenaKonfiguraciya}`,
    {
      method: "POST",
      body: params,
    }
  )
    .then(handleResponse)
    .catch(handleError);
}

// получаем статус зала по его ID
function getHallStatus(data, hallId) {
  const hall = data.result.halls.find((hall) => hall.id === Number(hallId));
  return hall ? hall.hall_open : null;
}

// считаем количество сеансов для конкретного зала
function countSeances(data, hallId) {
  return data.result.seances.filter(
    (seance) => seance.seance_hallid === Number(hallId)
  ).length;
}

// обновляем UI-кнопку и текст статуса
function updateButtonAndInfo(status, seanceCount) {
  if (status === 0 && seanceCount === 0) {
    knopkaOpenProdazhu.textContent = "Открыть продажу билетов";
    infoOpenProdazhu.textContent = "Добавьте сеансы в зал для открытия";
    knopkaOpenProdazhu.classList.add("button--disabled");
  } else if (status === 0 && seanceCount > 0) {
    knopkaOpenProdazhu.textContent = "Открыть продажу билетов";
    noviyStatusZal = 1;
    infoOpenProdazhu.textContent = "Всё готово к открытию";
    knopkaOpenProdazhu.classList.remove("button--disabled");
  } else {
    knopkaOpenProdazhu.textContent = "Приостановить продажу билетов";
    noviyStatusZal = 0;
    infoOpenProdazhu.textContent = "Зал открыт";
    knopkaOpenProdazhu.classList.remove("button--disabled");
  }
}

// функция проверки состояния зала
function proveritZalOtkrit(data, tekushayaOpenProdazhu) {
  infoOpenProdazhu = document.querySelector(".sales__status");
  knopkaOpenProdazhu = document.querySelector(".button--open");

  const tekushiyStatusZal = getHallStatus(data, tekushayaOpenProdazhu);
  const estSeansy = countSeances(data, tekushayaOpenProdazhu);

  updateButtonAndInfo(tekushiyStatusZal, estSeansy);
}

function otkritZakrityZal(tekushayaOpenProdazhu, noviyStatusZal) {

  const params = new FormData();
  params.set("hallOpen", `${noviyStatusZal}`);

  fetch(`https://shfe-diplom.neto-server.ru/open/${tekushayaOpenProdazhu}`, {
    method: "POST",
    body: params,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      alert("Статус зала изменен!");
    })
    .catch((error) => {
      console.error("Ошибка при изменении статуса зала:", error);
      alert("Не удалось изменить статус зала. Попробуйте позже.");
    });
}

function operaciiZalov(data) {
  // получение формы конфигурации зала
  formaZalKonfig = document.querySelector(".hall-config__form");

  const configSelectors = [
    ".hall-config__rows",
    ".hall-config__places",
    ".hall-config__seats",
    ".hall-config__controls .button--cancel",
    ".hall-config__controls .button--save"
  ];

  const [
    rowsElem,
    placesElem,
    seatsElem,
    cancelBtn,
    saveBtn
  ] = configSelectors.map((selector) => document.querySelector(selector));

  if (rowsElem && placesElem && seatsElem) {
    strZalKonfig = rowsElem;
    placesZalKonfig = placesElem;
    skhemaZal = seatsElem;
    cancelZalKonfig = cancelBtn;
    saveZalKonfig = saveBtn;
  } else {
    console.error("Не удалось найти элементы конфигурации зала");
    return;
  }

  for (let i = 0; i < data.result.halls.length; i++) {
    const hall = data.result.halls[i];

    if (zalyList) {
      const listItem = document.createElement("li");
      listItem.className = "halls-list__item";

      // создаем элемент span для отображения названия зала
      const hallName = document.createElement("span");
      hallName.className = "halls-list__name";
      hallName.dataset.id = hall.id;
      hallName.textContent = hall.hall_name;

      // создаем кнопку для удаления зала
      const removeBtn = document.createElement("span");
      removeBtn.className = "button--remove hall_remove";

      listItem.appendChild(hallName);
      listItem.appendChild(removeBtn);

      // добавляем созданный элемент списка в zalyList
      zalyList.appendChild(listItem);
    }

    // проверка состояния списка залов
    proverkaSpisokZalov();
    if (zalyKonfigList) {
      const { id, hall_name } = data.result.halls[i];
      zalyKonfigList.insertAdjacentHTML(
        "beforeend",
        `<li class="hall__item hall-config__item" data-id="${id}">${hall_name}</li>`
      );
    }

    // наличия контейнера для конфигурации цен 
    if (priceKonfigList) {
      const { id, hall_name } = data.result.halls[i];
      priceKonfigList.insertAdjacentHTML(
        "beforeend",
        `<li class="hall__item price-config__item" data-id="${id}">${hall_name}</li>`
      );
    }

    // наличия контейнера для открытой продажи билетов
    if (listOpenProdazhu) {
      const { id, hall_name } = data.result.halls[i];
      listOpenProdazhu.insertAdjacentHTML(
        "beforeend",
        `<li class="hall__item open__item" data-id="${id}">${hall_name}</li>`
      );
    }

    const { hall_name, id } = data.result.halls[i];
    seansyFilmovVremya.insertAdjacentHTML(
      "beforeend",
      `
      <section class="movie-seances__timeline">
        <div class="session-timeline__delete">
          <img src="./img/trash.png" alt="Удалить сеанс">
        </div>
        <h3 class="timeline__hall_title">${hall_name}</h3>
        <div class="timeline__seances" data-id="${id}">
        </div>
      </section>
      `
    );

    const udaleniyaVremya = document.querySelectorAll(".session-timeline__delete");
    udaleniyaVremya.forEach(element => element.classList.add("hidden"));
  }

  // проверка наличия элементов в zalyKonfigList и первого дочернего элемента
  if (zalyKonfigList?.firstElementChild) {
    const firstChild = zalyKonfigList.firstElementChild;

    firstChild.classList.add("hall_item-selected");

    // Получаем id текущего зала из атрибута
    currentZalKonfig = firstChild.getAttribute("data-id");

    // находим индекс текущего зала в массиве halls
    currentZalKonfigIndex = data.result.halls.findIndex(
      hall => hall.id === Number(currentZalKonfig)
    );

    if (currentZalKonfigIndex !== -1) {
      const currentHall = data.result.halls[currentZalKonfigIndex];

      strZalKonfig.value = currentHall.hall_rows;
      placesZalKonfig.value = currentHall.hall_places;

      // функция для отображения данных о зале
      pokazatZal(data, currentZalKonfigIndex);
      izmenitMesta(strSkhemaZal, data);
      izmenitRazmerZala(newZalKonfigMassiv, data);
    }
  }

  if (cancelZalKonfig) {
    // обработчик клика на кнопку отмены
    cancelZalKonfig.addEventListener("click", (event) => {
      if (cancelZalKonfig.classList.contains("button--disabled")) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      cancelZalKonfig.classList.add("button--disabled");
      saveZalKonfig.classList.add("button--disabled");

      pokazatZal(data, currentZalKonfigIndex);
      izmenitMesta(strSkhemaZal, data);
    });
  }

  // проверка существования элемента saveZalKonfig 
  if (saveZalKonfig) {
    saveZalKonfig.addEventListener("click", (event) => {
      if (saveZalKonfig.classList.contains("button--disabled")) {
        event.preventDefault();
        return;
      }

      // если активна -> вызываем функцию сохранения конфигурации
      event.preventDefault();
      sohranitKonfiguraciyu(currentZalKonfig, newZalKonfigMassiv);
    });
  }

  const firstItem = priceKonfigList.firstElementChild;
  if (firstItem) {
    firstItem.classList.add("hall_item-selected");

    tekushayaCenaKonfiguraciya = firstItem.dataset.id;

    // отображаем блок с ценами
    priceKonfig.classList.remove("hidden");

    // отображаем цены для выбранной конфигурации
    pokazatCeny(data, tekushayaCenaKonfiguraciya);
  }

  // проверка наличия кнопки отмены конфигурации цен
  const cancelButton = otmenaCenaKonfiguraciya;
  if (cancelButton) {
    cancelButton.addEventListener("click", (event) => {
      if (cancelButton.classList.contains("button--disabled")) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      cancelButton.classList.add("button--disabled");
      savePriceKonfig.classList.add("button--disabled");

      // отображаем цены для выбранной конфигурации
      pokazatCeny(data, tekushayaCenaKonfiguraciya);
    });
  }

  // проверка и обработка клика по кнопке сохранения цен
  const saveButton = savePriceKonfig;
  if (saveButton) {
    saveButton.addEventListener("click", (event) => {
      if (saveButton.classList.contains("button--disabled")) {
        event.preventDefault();
        return;
      }
      sohranitCeny(tekushayaCenaKonfiguraciya);
    });
  }

  // проверка наличия первого элемента в списке для открытых продаж
  const firstItemOpenSale = listOpenProdazhu.firstElementChild;
  if (firstItemOpenSale) {
    firstItemOpenSale.classList.add("hall_item-selected");

    tekushayaOpenProdazhu = firstItemOpenSale.getAttribute("data-id");

    proveritZalOtkrit(data, tekushayaOpenProdazhu);
  }

  zalyKonfigElements = document.querySelectorAll(".hall-config__item");

  zalyKonfigElements.forEach((item) => {
    item.addEventListener("click", () => {
      zalyKonfigElements.forEach((i) => i.classList.remove("hall_item-selected"));

      item.classList.add("hall_item-selected");

      if (item.classList.contains("hall_item-selected")) {
        currentZalKonfig = item.getAttribute("data-id");
      }

      if (cancelZalKonfig) {
        cancelZalKonfig.classList.add("button--disabled");
        saveZalKonfig.classList.add("button--disabled");
      }

      currentZalKonfigIndex = data.result.halls.findIndex(
        (hall) => hall.id === Number(currentZalKonfig)
      );

      if (currentZalKonfigIndex !== -1) {
        const selectedHall = data.result.halls[currentZalKonfigIndex];
        strZalKonfig.value = selectedHall.hall_rows;
        placesZalKonfig.value = selectedHall.hall_places;

        // Обновляем схему зала, места и размеры
        pokazatZal(data, currentZalKonfigIndex);
        izmenitMesta(strSkhemaZal, data);
        izmenitRazmerZala(newZalKonfigMassiv, data);
      }
    });
  });


  priceKonfigElements = document.querySelectorAll(".price-config__item");
  const setupPriceConfigSelection = () => {
    if (!priceKonfigElements || !priceKonfigElements.length) return;
    const handlePriceItemClick = (clickedItem) => {
      priceKonfigElements.forEach(el =>
        el.classList.remove("hall_item-selected")
      );

      clickedItem.classList.add("hall_item-selected");

      tekushayaCenaKonfiguraciya = clickedItem.dataset.id;

      if (otmenaCenaKonfiguraciya && savePriceKonfig) {
        otmenaCenaKonfiguraciya.classList.add("button--disabled");
        savePriceKonfig.classList.add("button--disabled");
      }

      // Показываем цены для выбранного зала
      pokazatCeny(data, tekushayaCenaKonfiguraciya);
    };

    priceKonfigElements.forEach(item => {
      item.addEventListener("click", () => handlePriceItemClick(item));

      item.onpointerdown = (e) => {
        if (e.button === 0) { // Проверяем левую кнопку мыши
          handlePriceItemClick(item);
        }
      };
    });
  };

  // инициализация при загрузке
  const initPriceConfig = () => {
    priceKonfigElements = document.querySelectorAll(".price-config__item") || [];
    setupPriceConfigSelection();

    if (priceKonfigElements[0]) {
      priceKonfigElements[0].click();
    }
  };

  // вызываем инициализацию
  initPriceConfig();

  elementyOpenProdazhu = document.querySelectorAll(".open__item");

  elementyOpenProdazhu.forEach((item) => {
    item.addEventListener("click", () => {
      elementyOpenProdazhu.forEach((i) => {
        i.classList.remove("hall_item-selected");
      });
      item.classList.add("hall_item-selected");

      if (item.classList.contains("hall_item-selected")) {
        tekushayaOpenProdazhu = item.getAttribute("data-id");
      }

      proveritZalOtkrit(data, tekushayaOpenProdazhu);
    });
  });


  if (knopkaOpenProdazhu) {
    knopkaOpenProdazhu.addEventListener("click", (event) => {
      event.preventDefault();

      if (knopkaOpenProdazhu.classList.contains("button--disabled")) return;

      otkritZakrityZal(tekushayaOpenProdazhu, noviyStatusZal);

      const tekushiyZal = data.result.halls.find(
        (hall) => hall.id === Number(tekushayaOpenProdazhu)
      );

      if (tekushiyZal) {
        tekushiyStatusZal = tekushiyZal.hall_open;
      }

      if (noviyStatusZal === 0) {
        knopkaOpenProdazhu.textContent = "Открыть продажу билетов";
        infoOpenProdazhu.textContent = "Всё готово к открытию";
        noviyStatusZal = 1;
      } else {
        knopkaOpenProdazhu.textContent = "Приостановить продажу билетов";
        infoOpenProdazhu.textContent = "Зал открыт";
        noviyStatusZal = 0;
      }
    });
  }


  // получаем все кнопки удаления залов
  zalyUdalitKnopka = document.querySelectorAll(".hall_remove");

  zalyUdalitKnopka.forEach((item) => {
    item.addEventListener("click", (e) => {

      let hallId = e.target.previousElementSibling.dataset.id;

      udalitZal(hallId);
    });
  })
}