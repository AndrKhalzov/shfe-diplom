// общая инициализация 
const loginForm = document.querySelector(".login__form");
const emailInput = document.querySelector(".login__input.login__email");
const passwordInput = document.querySelector(".login__input.login__password");

// обработчик отправки формы
function handleFormSubmit(event) {
  event.preventDefault();
  const isFormValid = emailInput.value.trim() && passwordInput.value.trim();
  if (isFormValid) {
    const formData = new FormData(loginForm);
    sendLoginRequest(formData);
  }
}

// отправка данных на сервер
function sendLoginRequest(formData) {
  fetch("https://shfe-diplom.neto-server.ru/login", {
    method: "POST",
    body: formData,
  })
    .then(handleLoginResponse)
    .catch(handleError);
}

// обработка ответа
function handleLoginResponse(response) {
  response.json()
    .then(data => {
      if (data.success) {
        redirectToAdminPage();
      } else {
        alert("Неверный логин/пароль!");
      }
    });
}

// перенаправление на страницу администратора
function redirectToAdminPage() {
  document.location = "./adm-page.html";
}

// обработка ошибок
function handleError(error) {
  console.error("Произошла ошибка при отправке запроса:", error);
}

// привязка обработчика к форме
loginForm.addEventListener("submit", handleFormSubmit);
