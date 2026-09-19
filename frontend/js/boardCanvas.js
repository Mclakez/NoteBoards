import { api } from "./api.js";
const photoBoard = document.querySelector('#photo-board');
const photoCount = document.querySelector('#photo-count');
const emptyBoardMessage = document.querySelector('#empty-board-message');
const modalBackdrop = document.querySelector('#modal-backdrop');
const modalContent = document.querySelector('#modal-content');
const modalClose = document.querySelector('#modal-close');
const addPhotoButton = document.querySelector('.add-photo-button');
const colourSwatches = document.querySelectorAll('.palette-swatch');

const storageKey = 'noteboards-photo-board';
const boardColourKey = 'noteboards-photo-board-colour';
const maximumPhotos = 20;
let cards = getStoredCards();
let activeCardId = null;
let dragState = null;
let rotationState = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getStoredCards() {
  const storedCards = localStorage.getItem(storageKey);

  if (!storedCards) {
    return [];
  }

  try {
    return JSON.parse(storedCards);
  } catch {
    return [];
  }
}

function saveCards() {
  localStorage.setItem(storageKey, JSON.stringify(cards));
}

function getBoardColour() {
  return localStorage.getItem(boardColourKey) || 'orange';
}

function setBoardColour(colour) {
  photoBoard.classList.remove('sage', 'blue');

  if (colour !== 'orange') {
    photoBoard.classList.add(colour);
  }

  colourSwatches.forEach((swatch) => {
    swatch.classList.toggle('active', swatch.dataset.boardColor === colour);
  });

  localStorage.setItem(boardColourKey, colour);
}

function createCardElement(card) {
  const cardElement = document.createElement('article');
  const cardImage = document.createElement('img');
  const menuButton = document.createElement('button');
  const cardTitle = document.createElement('h2');

  cardElement.className = 'polaroid-card';
  cardElement.dataset.cardId = card.id;
  cardElement.style.left = `${card.x}%`;
  cardElement.style.top = `${card.y}%`;
  cardElement.style.transform = `translate(-50%, -50%) rotate(${card.rotation}deg)`;
  cardElement.style.setProperty('--card-rotation', `${card.rotation}deg`);
  cardElement.style.zIndex = card.zIndex;

  cardImage.className = 'polaroid-image';
  cardImage.src = card.image;
  cardImage.alt = card.title || 'Board photo';

  menuButton.className = 'card-menu-button';
  menuButton.type = 'button';
  menuButton.ariaLabel = `Edit ${card.title || 'photo'}`;
  menuButton.textContent = '•••';

  const rotateHandles = createRotateHandles(card.title);

  cardTitle.className = 'polaroid-title';
  cardTitle.textContent = card.title || 'Untitled photo';

  cardElement.append(...rotateHandles, menuButton, cardImage, cardTitle);
  return cardElement;
}

function createRotateHandles(cardTitle) {
  const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return corners.map((corner) => {
    const rotateHandle = document.createElement('button');

    rotateHandle.className = 'rotate-handle';
    rotateHandle.type = 'button';
    rotateHandle.dataset.corner = corner;
    rotateHandle.ariaLabel = `Rotate ${cardTitle || 'photo'} from ${corner.replace('-', ' ')}`;
    rotateHandle.textContent = '↻';

    return rotateHandle;
  });
}

function renderCards() {
  photoBoard.querySelectorAll('.polaroid-card').forEach((cardElement) => {
    cardElement.remove();
  });

  cards.forEach((card) => {
    photoBoard.append(createCardElement(card));
  });

  photoCount.textContent = cards.length;
  emptyBoardMessage.hidden = cards.length > 0;
}

function getNextPosition() {
  const positions = [
    { x: 13, y: 26, rotation: -2 },
    { x: 37, y: 58, rotation: 15 },
    { x: 67, y: 69, rotation: -13 },
    { x: 84, y: 28, rotation: -13 },
    { x: 54, y: 31, rotation: 6 },
  ];

  return positions[cards.length % positions.length];
}

function getHighestZIndex() {
  return cards.reduce((highestZIndex, card) => Math.max(highestZIndex, card.zIndex || 1), 1);
}

function getCardById(cardId) {
  return cards.find((card) => card.id === cardId);
}

function openModal(contentMarkup) {
  modalContent.innerHTML = contentMarkup;
  modalBackdrop.hidden = false;
}

function closeModal() {
  modalBackdrop.hidden = true;
  modalContent.innerHTML = '';
  activeCardId = null;
}

function getEditorMarkup(card) {
  const isNewCard = !card;
  const formTitle = isNewCard ? 'Upload image' : 'Edit photo';
  const safeTitle = escapeHtml(card?.title || '');
  const safeDescription = escapeHtml(card?.description || '');
  const previewMarkup = card?.image
    ? `<img class="modal-image-preview" src="${card.image}" alt="${safeTitle || 'Photo preview'}" />`
    : `<label class="upload-area" for="photo-input"><input id="photo-input" type="file" accept="image/*" /><span class="upload-prompt"><span class="upload-icon">＋</span>Upload image</span></label>`;
  const deleteMarkup = isNewCard
    ? ''
    : '<button class="modal-button delete" id="delete-photo-button" type="button">DELETE</button>';

  return `
    <form class="photo-form" id="photo-form">
      <h2 id="modal-title" class="sr-only">${formTitle}</h2>
      <div id="image-field">${previewMarkup}</div>
      ${isNewCard ? '' : '<label class="replace-image-label" for="photo-input">Replace image<input id="photo-input" type="file" accept="image/*" /></label>'}
      <label for="photo-title">Title</label>
      <input id="photo-title" type="text" maxlength="60" value="${safeTitle}" placeholder="Chilling with the boys" required />
      <label for="photo-description">Description</label>
      <textarea id="photo-description" maxlength="800" placeholder="Add a description">${safeDescription}</textarea>
      <button class="modal-button" type="submit">SAVE</button>
      ${deleteMarkup}
    </form>
  `;
}

function openCreateModal() {
  if (cards.length >= maximumPhotos) {
    return;
  }

  activeCardId = null;
  openModal(getEditorMarkup(null));
  setupPhotoForm();
}

function openEditModal(cardId) {
  const card = getCardById(cardId);

  if (!card) {
    return;
  }

  activeCardId = cardId;
  openModal(getEditorMarkup(card));
  setupPhotoForm();
}

function openViewModal(cardId) {
  const card = getCardById(cardId);

  if (!card) {
    return;
  }

  activeCardId = cardId;
  const safeTitle = escapeHtml(card.title || 'Untitled photo');
  const safeDescription = escapeHtml(card.description || 'No description added yet.');
  openModal(`
    <h2 id="modal-title" class="sr-only">${safeTitle}</h2>
    <img class="modal-image-preview" src="${card.image}" alt="${safeTitle}" />
    <h3 class="view-title">${safeTitle}</h3>
    <p class="view-description">${safeDescription}</p>
  `);
}

function displaySelectedImage(file) {
  const imageField = modalContent.querySelector('#image-field');
  const fileReader = new FileReader();

  fileReader.addEventListener('load', () => {
    imageField.innerHTML = `<img class="modal-image-preview" src="${fileReader.result}" alt="Selected photo preview" />`;
    imageField.dataset.image = fileReader.result;
  });

  fileReader.readAsDataURL(file);
}

function handlePhotoFileSelection(event) {
  const selectedFile = event.target.files[0];

  if (selectedFile) {
    displaySelectedImage(selectedFile);
  }
}

function savePhoto(event) {
  event.preventDefault();

  const titleInput = modalContent.querySelector('#photo-title');
  const descriptionInput = modalContent.querySelector('#photo-description');
  const imageField = modalContent.querySelector('#image-field');
  const image = imageField.dataset.image || getCardById(activeCardId)?.image;

  if (!image) {
    modalContent.querySelector('.upload-area')?.focus();
    return;
  }

  if (activeCardId) {
    const existingCard = getCardById(activeCardId);
    existingCard.title = titleInput.value.trim();
    existingCard.description = descriptionInput.value.trim();
    existingCard.image = image;
  } else {
    const position = getNextPosition();
    cards.push({
      id: crypto.randomUUID(),
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      image,
      ...position,
      zIndex: getHighestZIndex() + 1,
    });
  }

  saveCards();
  renderCards();
  closeModal();
}

function deletePhoto() {
  cards = cards.filter((card) => card.id !== activeCardId);
  saveCards();
  renderCards();
  closeModal();
}

function setupPhotoForm() {
  modalContent.querySelector('#photo-form').addEventListener('submit', savePhoto);
  modalContent.querySelector('#photo-input')?.addEventListener('change', handlePhotoFileSelection);
  modalContent.querySelector('#delete-photo-button')?.addEventListener('click', deletePhoto);
}

function handleBoardClick(event) {
  const menuButton = event.target.closest('.card-menu-button');

  if (menuButton) {
    openEditModal(menuButton.closest('.polaroid-card').dataset.cardId);
    return;
  }

  if (event.target.closest('.rotate-handle')) {
    return;
  }

  const cardElement = event.target.closest('.polaroid-card');

  if (cardElement && !dragState?.hasMoved) {
    openViewModal(cardElement.dataset.cardId);
  }
}

function startDraggingCard(event) {
  const cardElement = event.target.closest('.polaroid-card');

  if (
    !cardElement ||
    event.target.closest('.card-menu-button') ||
    event.target.closest('.rotate-handle')
  ) {
    return;
  }

  const card = getCardById(cardElement.dataset.cardId);
  const boardBounds = photoBoard.getBoundingClientRect();
  const cardBounds = cardElement.getBoundingClientRect();

  dragState = {
    card,
    cardElement,
    offsetX: event.clientX - cardBounds.left - (cardBounds.width / 2),
    offsetY: event.clientY - cardBounds.top - (cardBounds.height / 2),
    boardBounds,
    hasMoved: false,
  };

  card.zIndex = getHighestZIndex() + 1;
  cardElement.style.zIndex = card.zIndex;
  cardElement.classList.add('dragging');
  cardElement.setPointerCapture(event.pointerId);
}

function handleBoardPointerDown(event) {
  if (event.target.closest('.rotate-handle')) {
    startRotatingCard(event);
    return;
  }

  startDraggingCard(event);
}

function dragCard(event) {
  if (!dragState) {
    return;
  }

  const { boardBounds, card, cardElement, offsetX, offsetY } = dragState;
  const x = ((event.clientX - boardBounds.left - offsetX) / boardBounds.width) * 100;
  const y = ((event.clientY - boardBounds.top - offsetY) / boardBounds.height) * 100;

  card.x = Math.min(92, Math.max(8, x));
  card.y = Math.min(87, Math.max(13, y));
  cardElement.style.left = `${card.x}%`;
  cardElement.style.top = `${card.y}%`;
  dragState.hasMoved = true;
}

function stopDraggingCard() {
  if (!dragState) {
    return;
  }

  dragState.cardElement.classList.remove('dragging');
  saveCards();
  setTimeout(() => {
    dragState = null;
  }, 0);
}

function getPointerAngle(event, cardElement) {
  const cardBounds = cardElement.getBoundingClientRect();
  const centerX = cardBounds.left + (cardBounds.width / 2);
  const centerY = cardBounds.top + (cardBounds.height / 2);

  return Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
}

function startRotatingCard(event) {
  const rotateHandle = event.target.closest('.rotate-handle');

  if (!rotateHandle) {
    return;
  }

  const cardElement = rotateHandle.closest('.polaroid-card');
  const card = getCardById(cardElement.dataset.cardId);

  event.preventDefault();
  event.stopPropagation();

  rotationState = {
    card,
    cardElement,
    startAngle: getPointerAngle(event, cardElement),
    startRotation: Number(card.rotation) || 0,
  };

  card.zIndex = getHighestZIndex() + 1;
  cardElement.style.zIndex = card.zIndex;
  cardElement.classList.add('rotating');
  rotateHandle.setPointerCapture(event.pointerId);
}

function rotateCard(event) {
  if (!rotationState) {
    return;
  }

  const pointerAngle = getPointerAngle(event, rotationState.cardElement);
  const rotationChange = pointerAngle - rotationState.startAngle;
  const newRotation = Math.round(rotationState.startRotation + rotationChange);

  rotationState.card.rotation = newRotation;
  rotationState.cardElement.style.transform = `translate(-50%, -50%) rotate(${newRotation}deg)`;
  rotationState.cardElement.style.setProperty('--card-rotation', `${newRotation}deg`);
}

function stopRotatingCard() {
  if (!rotationState) {
    return;
  }

  rotationState.cardElement.classList.remove('rotating');
  saveCards();
  setTimeout(() => {
    rotationState = null;
  }, 0);
}

function initializeBoard() {
  setBoardColour(getBoardColour());
  renderCards();
  addPhotoButton.addEventListener('click', openCreateModal);
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });
  colourSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => setBoardColour(swatch.dataset.boardColor));
  });
  photoBoard.addEventListener('click', handleBoardClick);
  photoBoard.addEventListener('pointerdown', handleBoardPointerDown);
  photoBoard.addEventListener('pointermove', dragCard);
  photoBoard.addEventListener('pointermove', rotateCard);
  photoBoard.addEventListener('pointerup', stopDraggingCard);
  photoBoard.addEventListener('pointercancel', stopDraggingCard);
  photoBoard.addEventListener('pointerup', stopRotatingCard);
  photoBoard.addEventListener('pointercancel', stopRotatingCard);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modalBackdrop.hidden) {
      closeModal();
    }
  });
}

initializeBoard();
