export { enableValidation, clearValidation }
 function showInputError(formElement, inputElement, errorMessage, settings) {
  const elementError = formElement.querySelector(`#${inputElement.id}-error`)
  inputElement.classList.add(settings.inputErrorClass)
  if (elementError) {
    elementError.textContent = errorMessage
    elementError.classList.add(settings.errorClass)
  }
}

function hideInputError(formElement, inputElement, settings){
  const elementError = formElement.querySelector(`#${inputElement.id}-error`)
  inputElement.classList.remove(settings.inputErrorClass)
  if(elementError){
    elementError.textContent = ""
    elementError.classList.remove(settings.errorClass)
  }
}

function checkInputValidity(formElement, inputElement, settings){
  const value = inputElement.value.trim()
  const errorMessage = inputElement.dataset.errorMessage

  if (value === "") {
    showInputError(formElement, inputElement, "Поле обязательно для заполнения", settings)
    return
  }

  let minLength = 2
  let maxLength = 99999999;
  if (inputElement.classList.contains("popup__input_type_name")){
    maxLength = 40
  }
  if (inputElement.classList.contains("popup__input_type_card-name")) {
    maxLength = 30
  }
  if (inputElement.classList.contains("popup__input_type_description")) {
    maxLength = 200
  }

  if (value.length < minLength || value.length > maxLength) {
    let message = `Длина должна быть от ${minLength} до ${maxLength} символов`
    showInputError(formElement, inputElement, message, settings)
    return;
  }

  if (inputElement.classList.contains("popup__input_type_name") || 
    inputElement.classList.contains("popup__input_type_card-name")){
      const chars = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/
      if (!chars.test(value)) {
        const message = inputElement.dataset.errorMessage || "Разрешены только буквы, пробелы и дефис"
        showInputError(formElement, inputElement, message, settings)
        return
      }
    }

    if (inputElement.classList.contains("popup__input_type_url")) {
    const urlChar = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&=/:]*)$/;
    if (!urlChar.test(value)) {
      showInputError(formElement, inputElement, "Введите корректную ссылку", settings)
      return
    }
  }
    hideInputError(formElement, inputElement, settings)
}

function hasInvalidInput(formElement, settings) {
  const inputElements = formElement.querySelectorAll(settings.inputSelector)
  return Array.from(inputElements).some(input => input.classList.contains(settings.inputErrorClass))
}

function disableSubmitButton(formElement, settings) {
  const button = formElement.querySelector(settings.submitButtonSelector)
  button.disabled = true
  button.classList.add(settings.inactiveButtonClass)
}

function enableSubmitButton(formElement, settings) {
  const button = formElement.querySelector(settings.submitButtonSelector)
  button.disabled = false
  button.classList.remove(settings.inactiveButtonClass)
}

function toggleButtonState(formElement, settings) {
  if (hasInvalidInput(formElement, settings)) {
    disableSubmitButton(formElement, settings)
  } else {
    enableSubmitButton(formElement, settings)
  }
}

function setEventListeners(formElement, settings) {
  const inputList = formElement.querySelectorAll(settings.inputSelector)

  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings)
      toggleButtonState(formElement, settings)
    });
  });
}

function clearValidation(formElement, settings) {
  const inputList = formElement.querySelectorAll(settings.inputSelector)

  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings)
  })
  disableSubmitButton(formElement, settings)
}

function enableValidation(settings) {
  const formList = document.querySelectorAll(settings.formSelector)
  formList.forEach((formElement) => {
    setEventListeners(formElement, settings);
    toggleButtonState(formElement, settings);
  });
}