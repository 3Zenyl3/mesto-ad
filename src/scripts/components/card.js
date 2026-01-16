//export const likeCard = (likeButton) => {
//  likeButton.classList.toggle("card__like-button_is-active");
//};

import { changeLikeCardStatus } from "./api.js"; 

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onDeleteCard }
) => {
  const cardElement = getTemplate();

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");

  // Заполняем данные
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;
  likeCount.textContent = data.likes.length;

  // Проверяем, поставлен ли лайк текущим пользователем
  if (data.likes.some(like => like._id === userId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Показываем кнопку удаления только автору
  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(data._id, cardElement);
    });
  }

  // Обработчик клика по изображению
  cardImage.addEventListener("click", () => {
    onPreviewPicture({ name: data.name, link: data.link });
  });

  // Обработчик лайка — отправка на сервер
  likeButton.addEventListener("click", () => {
    const isLiked = likeButton.classList.contains("card__like-button_is-active");

    changeLikeCardStatus(data._id, isLiked)
      .then((updatedCard) => {
        // Обновляем состояние кнопки и количество лайков
        likeButton.classList.toggle("card__like-button_is-active");
        likeCount.textContent = updatedCard.likes.length;
      })
      .catch((err) => {
        console.log("Ошибка при лайке:", err);
      });
  });

  return cardElement;
};
