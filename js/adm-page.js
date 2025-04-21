// обработка кликов по стрелкам заголовков секций -> сворачивание / разворачивание блоков
document.querySelectorAll(".admin-section__toggle").forEach(strelka => {
  strelka.onclick = () => {
    const zagolovok = strelka.closest(".admin-section__header");
    const obertka = zagolovok?.nextElementSibling;
    strelka.classList.toggle("admin__header_arrow-hide");
    obertka?.classList.toggle("admin__wrapper-hide");
  };
});

// закрытие и отмена popup
const okna = [...document.querySelectorAll(".popup")]; 
const knopkiZakrytiya = [...document.querySelectorAll(".popup__close")]; 
const formy = [...document.querySelectorAll(".popup__form")]; 
const knopkiOtmeny = [...document.querySelectorAll(".button--cancel")]; 

for (const okno of okna) {
  for (const closeBtn of knopkiZakrytiya) {
    //"крестик" — скрыть окно
    closeBtn.addEventListener("click", () => {
      okno.classList.add("popup--hidden");
    });
  }
  for (const form of formy) {
    for (const cancelBtn of knopkiOtmeny) {
      // "отмена" — сбросить форму и скрыть окно
      cancelBtn.onclick = () => {
        form.reset();
        okno.classList.add("popup--hidden");
      };
    }
  }
}

// загрузка данных с сервера
(async () => {
  try {
    const response = await fetch("https://shfe-diplom.neto-server.ru/alldata");
    const data = await response.json();
    //запуск обработчиков для залов / фильмов / сеансов
    operaciiZalov(data);
    operaciiFilmov(data);
    operaciiSeansov(data);
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }
})();
