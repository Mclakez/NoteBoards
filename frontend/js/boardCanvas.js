import { api } from "./api.js";
const photoBoard = document.querySelector('#photo-board');
const photoCount = document.querySelector('#photo-count');
const emptyBoardMessage = document.querySelector('#empty-board-message');
const modalBackdrop = document.querySelector('#modal-backdrop');
const modalContent = document.querySelector('#modal-content');
const modalClose = document.querySelector('#modal-close');
const addPhotoButton = document.querySelector('.add-photo-button');
const colourSwatches = document.querySelectorAll('.palette-swatch');
const boardTitle = document.querySelector('#board-title');
const boardName = document.querySelector('#board-name');

const canvasId = new URLSearchParams(window.location.search).get('canvasId');
const storageKey = 'noteboards-photo-board';
const boardColourKey = 'noteboards-photo-board-colour';
const maximumPhotos = 20;
const MOBILE_BREAKPOINT = 768;
let cards = [];
let activeCardId = null;
let dragState = null;
let rotationState = null;
let boardTitleSaveTimer = null;
let lastSavedBoardTitle = '';
let thumbnailTimer = null;

function normalizeBoardTitle(value) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
  return normalized || 'Untitled board';
}

function syncBoardTitleDisplay(title) {
  const displayTitle = normalizeBoardTitle(title);

  if (boardTitle) {
    boardTitle.textContent = displayTitle;
  }

  if (boardName && document.activeElement !== boardName) {
    boardName.textContent = displayTitle;
  }
}

async function persistBoardTitle(title) {
  if (!canvasId) {
    return;
  }

  const nextTitle = normalizeBoardTitle(title);

  try {
    const updatedBoard = await api.patch(`/boardCanvas/update/${canvasId}`, { title: nextTitle });
    const savedTitle = updatedBoard?.title || nextTitle;
    lastSavedBoardTitle = savedTitle;
    syncBoardTitleDisplay(savedTitle);
  } catch (error) {
    console.error('Failed to save board title:', error);
    syncBoardTitleDisplay(lastSavedBoardTitle || 'Untitled board');
  }
}

function handleBoardTitleInput() {
  if (!boardName) {
    return;
  }

  const nextTitle = normalizeBoardTitle(boardName.textContent);
  syncBoardTitleDisplay(nextTitle);

  if (boardTitleSaveTimer) {
    clearTimeout(boardTitleSaveTimer);
  }

  boardTitleSaveTimer = setTimeout(() => {
    persistBoardTitle(nextTitle);
  }, 250);
}

function setButtonLoading(button, isLoading, label = 'Loading...') {
  if (!button) {
    return;
  }

  const originalText = button.dataset.defaultText || button.textContent.trim();

  button.dataset.defaultText = originalText;
  button.disabled = isLoading;
  button.classList.toggle('is-loading', isLoading);
  button.setAttribute('aria-busy', String(isLoading));

  if (isLoading) {
    button.innerHTML = `<span class="button-spinner" aria-hidden="true"></span><span>${label}</span>`;
  } else {
    button.innerHTML = originalText;
  }
}

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

async function loadBoard() {
  if (!canvasId) {
    return;
  }

  setButtonLoading(addPhotoButton, true, 'Loading');

  try {
    const data = await api.get(`/boardCanvas/${canvasId}`);
    const boardCards = data.notes || [];

    cards = boardCards.map((card) => clampCardPosition({
      id: card._id,
      title: card.title || 'Untitled photo',
      description: card.description || '',
      image: card.cardImageUrl || '',
      x: Number(card.x ?? 50),
      y: Number(card.y ?? 50),
      rotation: Number(card.rotation ?? 0),
      zIndex: Number(card.z_index ?? 1),
    }));

    if (data.canvas?.title) {
      const title = data.canvas.title;
      lastSavedBoardTitle = title;
      syncBoardTitleDisplay(title);
    }

    renderCards();
  } finally {
    setButtonLoading(addPhotoButton, false, '+');
  }
}

function isMobileBoard() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function getCardDragLimits() {
  if (isMobileBoard()) {
    return { minX: 12, maxX: 88, minY: 12, maxY: 88 };
  }

  return { minX: 8, maxX: 92, minY: 13, maxY: 87 };
}

function clampCardPosition(card) {
  const { minX, maxX, minY, maxY } = getCardDragLimits();

  card.x = Math.min(maxX, Math.max(minX, Number(card.x ?? minX)));
  card.y = Math.min(maxY, Math.max(minY, Number(card.y ?? minY)));

  return card;
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
    imageField.dataset.fileName = file.name || 'upload-image';
  });

  fileReader.readAsDataURL(file);
}

function handlePhotoFileSelection(event) {
  const selectedFile = event.target.files[0];

  if (selectedFile) {
    displaySelectedImage(selectedFile);
  }
}

async function saveScreenshot() {
  const cards = photoBoard.querySelectorAll('.polaroid-card');

  if (!photoBoard || !canvasId || cards.length === 0) {
    return;
  }

  const boardRect = photoBoard.getBoundingClientRect();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  cards.forEach((card) => {
    const cardRect = card.getBoundingClientRect();
    const left = cardRect.left - boardRect.left;
    const top = cardRect.top - boardRect.top;
    const right = left + cardRect.width;
    const bottom = top + cardRect.height;

    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  });

  const padding = 40;

  const screenshotCanvas = await html2canvas(photoBoard, {
    x: minX - padding,
    y: minY - padding,
    width: Math.max(1, maxX - minX + (padding * 2)),
    height: Math.max(1, maxY - minY + (padding * 2)),
    scale: Math.min(window.devicePixelRatio || 1, 2),
    useCORS: true,
    logging: false,
    backgroundColor: '#f5f5f5',
  });

  screenshotCanvas.toBlob(async (blob) => {
    if (!blob) {
      return;
    }

    const formData = new FormData();
    formData.append('thumbnail', blob, 'board-thumbnail.png');

    try {
      await api.post(`/boardCanvas/${canvasId}/thumbnail`, formData);
    } catch (error) {
      console.error('Board thumbnail save failed:', error);
    }
  }, 'image/png');
}

function scheduleScreenshotTimer() {
  clearTimeout(thumbnailTimer);
  thumbnailTimer = setTimeout(async () => {
    try {
      await saveScreenshot();
      console.log('Board thumbnail updated in Cloudinary');
    } catch (error) {
      console.error('Failed to auto-save board thumbnail:', error);
    }
  }, 1000);
}

async function savePhoto(event) {
  event.preventDefault();

  if (!canvasId) {
    return;
  }

  const titleInput = modalContent.querySelector('#photo-title');
  const descriptionInput = modalContent.querySelector('#photo-description');
  const imageField = modalContent.querySelector('#image-field');
  const selectedFile = modalContent.querySelector('#photo-input')?.files?.[0];
  const existingImage = getCardById(activeCardId)?.image;
  const imageDataUrl = imageField?.dataset.image;
  const submitButton = modalContent.querySelector('.modal-button[type="submit"]');

  if (!selectedFile && !existingImage && !imageDataUrl) {
    modalContent.querySelector('.upload-area')?.focus();
    return;
  }

  setButtonLoading(submitButton, true, 'Saving...');

  try {
    const formData = new FormData();
    formData.append('title', titleInput.value.trim());
    formData.append('description', descriptionInput.value.trim());

    if (selectedFile) {
      formData.append('image', selectedFile);
    } else if (imageDataUrl && imageDataUrl.startsWith('data:image/')) {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const fileName = imageField.dataset.fileName || 'board-photo.png';
      formData.append('image', blob, fileName);
    }

    if (activeCardId) {
      await api.patch(`/boardCard/${canvasId}/${activeCardId}`, formData);
    } else {
      await api.post(`/boardCard/${canvasId}`, formData);
    }

    await loadBoard();
    scheduleScreenshotTimer();
    closeModal();
  } finally {
    setButtonLoading(submitButton, false, 'SAVE');
  }
}

async function deletePhoto() {
  if (!canvasId || !activeCardId) {
    return;
  }

  const deleteButton = modalContent.querySelector('#delete-photo-button');
  setButtonLoading(deleteButton, true, 'Deleting...');

  try {
    await api.delete(`/boardCard/${canvasId}/${activeCardId}`);
    await loadBoard();
    scheduleScreenshotTimer();
    closeModal();
  } finally {
    setButtonLoading(deleteButton, false, 'DELETE');
  }
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
  const { minX, maxX, minY, maxY } = getCardDragLimits();

  card.x = Math.min(maxX, Math.max(minX, x));
  card.y = Math.min(maxY, Math.max(minY, y));
  cardElement.style.left = `${card.x}%`;
  cardElement.style.top = `${card.y}%`;
  dragState.hasMoved = true;
}

async function stopDraggingCard() {
  if (!dragState) {
    return;
  }

  dragState.cardElement.classList.remove('dragging');

  const { card } = dragState;

  if (canvasId && card?.id) {
    await api.patch(`/boardCard/${canvasId}/${card.id}`, {
      x: card.x,
      y: card.y,
      z_index: card.zIndex,
    });
    scheduleScreenshotTimer();
  }

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

async function stopRotatingCard() {
  if (!rotationState) {
    return;
  }

  rotationState.cardElement.classList.remove('rotating');

  const { card } = rotationState;

  if (canvasId && card?.id) {
    await api.patch(`/boardCard/${canvasId}/${card.id}`, {
      rotation: card.rotation,
      z_index: card.zIndex,
    });
    scheduleScreenshotTimer();
  }

  setTimeout(() => {
    rotationState = null;
  }, 0);
}

async function initializeBoard() {
  setBoardColour(getBoardColour());
  await loadBoard();
  scheduleScreenshotTimer();
  addPhotoButton.addEventListener('click', openCreateModal);
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });

  if (boardName) {
    boardName.addEventListener('input', handleBoardTitleInput);
    boardName.addEventListener('blur', () => {
      if (boardTitleSaveTimer) {
        clearTimeout(boardTitleSaveTimer);
      }

      const finalTitle = normalizeBoardTitle(boardName.textContent);
      syncBoardTitleDisplay(finalTitle);
      persistBoardTitle(finalTitle);
    });
  }

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
  window.addEventListener('resize', () => {
    if (!cards.length) {
      return;
    }

    cards = cards.map((card) => clampCardPosition(card));
    renderCards();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modalBackdrop.hidden) {
      closeModal();
    }
  });
}

initializeBoard();
