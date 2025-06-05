// обработка кликов по стрелкам заголовков секций -> сворачивание / разворачивание блоков
document.querySelectorAll(".admin-section__toggle").forEach((strelka) => {
  strelka.onclick = () => {
    const zagolovok = strelka.closest(".admin-section__header");
    const obertka = zagolovok?.nextElementSibling;
    strelka.classList.toggle("admin__header_arrow-hide");
    obertka?.classList.toggle("admin__wrapper-hide");
  };
});

// закрытие и отмена popup
document.querySelectorAll(".popup").forEach((popup) => {
  const closeBtn = popup.querySelector(".popup__close");
  const cancelBtn = popup.querySelector(".button--cancel");
  const form = popup.querySelector(".popup__form");

  // закрытие по крестику
  closeBtn?.addEventListener("click", () => {
    popup.classList.add("popup--hidden");
  });

  // закрытие по кнопке
  cancelBtn?.addEventListener("click", () => {
    form?.reset();
    popup.classList.add("popup--hidden");
  });
});

// загрузка данных с сервера

async function poluchitDannye(callHandlers = true) {
  try {
    const response = await fetch("https://shfe-diplom.neto-server.ru/alldata");
    const data = await response.json();

    // запуск при инициализации
    operaciiZalov(data);
    operaciiFilmov(data);
    operaciiSeansov(data);
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
    return null;
  }
}

(async () => {
  await poluchitDannye();
})();
