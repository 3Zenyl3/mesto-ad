/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
// импорт апишек и функций
import { enableValidation, clearValidation } from "./components/validation.js";
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import {
  getUserInfo, getCardList, setUserInfo, updateUserAvatar,
  addCard, deleteCard, changeLikeCardStatus
} from './components/api.js';

let currentUserId = null;

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const infoModalWindow = document.querySelector(".popup_type_info");
const infoList = infoModalWindow.querySelector(".popup__info");
const usersWithCardsList = infoModalWindow.querySelector(".popup__list");

const infoTemplate = document.querySelector("#popup-info-definition-template").content;
const userPreviewTemplate = document.querySelector("#popup-info-user-preview-template").content;

const logo = document.querySelector(".header__logo"); 

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};
//обрабатываем отправку имени, статуса и тд.....
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  // Значения с формы
  const name = profileTitleInput.value;
  const about = profileDescriptionInput.value;

  //Кидаем значения формы на серв
  setUserInfo({ name, about })
    .then((userData) => {
      // Апдейтим данные на странице
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.error('Ошибка при обновлении профиля:', err);
    });
};
//отправка авы на сервер
const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  // Пока запрос нельзя нажать кнопку отправки
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";

  updateUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = initialText;
    });
};
//добавляем карточку
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  // Пока запрос нельзя нажать кнопку отправки
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      // Создаём элемент карточки и добавляем в начало списка
      placesWrap.prepend(
        createCardElement(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onDeleteCard: (cardId, cardElement) => {
            if (window.confirm("Удалить карточку?")) {
              deleteCard(cardId)
                .then(() => cardElement.remove())
                .catch((err) => {
                  console.log(err);
                  cardElement.remove();
                });
            }
          },
        })
      );
      // Закрываем окно
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = initialText;
    });
};

//Слушатели
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
//открытие профиля по клику
openProfileFormButton.addEventListener("click", () => {
  //строки там заполняем этими данными
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});
// тоже и с аватаркой
profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});
// и с карточками
openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});



//закрытие всех окон
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};
//квючаем валидацию для форм
enableValidation(validationSettings);
//грузим данные с сервера
Promise.all([getCardList(), getUserInfo()])
  // берем айдишник
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    // апдейтим профиль по полученным с сервера данным
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    // рисуем карточки с сервера и еще тут есть функционал удаления карты
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onDeleteCard: (cardId, cardElement) => {
            // Подтверждение удаления
            if (window.confirm("Вы уверены, что хотите удалить эту карточку?")) {
              deleteCard(cardId)
                .then(() => {
                  cardElement.remove(); // Удаляем с страницы
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          },
        }
        )
      );
    });
  })
  .catch((err) => {
    console.log(err); // В случае возникновения ошибки выводим её в консоль
  }); 

// 3 вариант начинается тут
// Статистика всего сайта и пользователей по кнопке слева сверху
const openInfoModal = () => {
  // Очищаем предыдущие данные
  infoList.innerHTML = "";
  usersWithCardsList.innerHTML = "";

  getCardList()
    .then((cards) => {
      if (!cards.length) {
        infoList.innerHTML = "<p>Нет данных для отображения.</p>";
        openModalWindow(infoModalWindow);
        return;
      }

      //Мап всех пользователей, создавших карточки
      const userMap = new Map(); 
      const cardLikes = [...cards].sort((a, b) => b.likes.length - a.likes.length).slice(0, 5); // Топ-5 по лайкам
      // статистика по каждому пользователю
      cards.forEach(card => {
        const ownerId = card.owner._id;
        const ownerName = card.owner.name;

        if (!userMap.has(ownerId)) {
          userMap.set(ownerId, {
            name: ownerName,
            cardCount: 0,
            likeCount: 0
          });
        }

        const userData = userMap.get(ownerId);
        userData.cardCount += 1;
        userData.likeCount += card.likes.length;
      });

      const users = Array.from(userMap.values());
      const uniqueUsers = users.length;
      const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);

      // Находим пользователя с максимальным количеством лайков
      const topLiker = users.sort((a, b) => b.likeCount - a.likeCount)[0];
      // фция для отображения строки в статитсике
      const fillInfoItem = (term, description) => {
        const element = infoTemplate.cloneNode(true);
        element.querySelector(".popup__info-term").textContent = term;
        element.querySelector(".popup__info-description").textContent = description;
        infoList.appendChild(element);
      };
      
      // заполняем данные в окно
      fillInfoItem("Всего пользователей", uniqueUsers);
      fillInfoItem("Всего лайков", totalLikes);
      fillInfoItem("Максимум лайков от одного", topLiker ? topLiker.likeCount : 0);
      if (topLiker) {
        fillInfoItem("Чемпион лайков", topLiker.name);
      }

      // Добавляем названия популярные карточки
      cardLikes.forEach(card => {
        const element = userPreviewTemplate.cloneNode(true);
        // Обрезаем название до 12 символов
        const name = card.name.length > 12 ? card.name.slice(0, 12) + "…" : card.name;
        element.textContent = name + ", ";
        element.title = card.name;
        usersWithCardsList.appendChild(element);
      });

      // Открываем это окно
      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при загрузке статистики:", err);
      infoList.innerHTML = "<p>Ошибка загрузки данных.</p>";
      openModalWindow(infoModalWindow);
    });
};
// лисэнер на логотип
logo.addEventListener("click", openInfoModal)