const dashboardKind = document.body.dataset.dashboard;
const dashboardNoun = dashboardKind === 'board' ? 'Board' : 'Note';
const dashboardTitle = dashboardKind === 'board' ? 'My handsome face' : 'Trip to Ogbomoso';
const pinnedCardGrid = document.querySelector('.pinned .card-grid');
const otherCardGrid = document.querySelector('.other-section .card-grid');
const dashboardToast = document.querySelector('.toast');
const dashboardStorageKey = `noteboards-${dashboardKind}s`;
let dashboardToastTimer;

function getDefaultItems() {
  return [
    { pinned: true, name: dashboardTitle },
    { pinned: true, name: dashboardTitle },
    { pinned: true, name: dashboardTitle },
    { pinned: true, name: dashboardTitle },
    { pinned: false, name: dashboardTitle },
    { pinned: false, name: dashboardTitle },
    { pinned: false, name: dashboardTitle },
    { pinned: false, name: dashboardTitle },
  ];
}

function getStoredItems() {
  const storedItems = localStorage.getItem(dashboardStorageKey);

  return storedItems ? JSON.parse(storedItems) : getDefaultItems();
}

function saveItems(items) {
  localStorage.setItem(dashboardStorageKey, JSON.stringify(items));
}

function getPreviewMarkup() {
  if (dashboardKind === 'board') {
    return '';
  }

  return `
    <div class="palette" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
    </div>
    <span class="sticky red">The trip was memorable; see you around 4pm.</span>
    <span class="sticky blue">The trip was memorable; see you around 4pm.</span>
    <span class="sticky green">The trip was memorable; see you around 4pm.</span>
  `;
}

function createCardMarkup(item) {
  const pinActionLabel = item.pinned ? 'Unpin' : 'Pin';

  return `
    <article class="dashboard-card" data-name="${item.name}" data-pinned="${item.pinned}">
      <div class="card-preview ${dashboardKind}-preview">${getPreviewMarkup()}</div>
      <button class="menu-toggle" type="button" aria-label="Open ${dashboardNoun} menu">•••</button>
      <div class="card-menu">
        <button class="close-menu" type="button" aria-label="Close menu">×</button>
        <button type="button" data-action="pin">♙ ${pinActionLabel}</button>
        <button type="button" data-action="delete">♙ Delete</button>
      </div>
      <div class="card-meta">
        <div class="card-title">${item.name}</div>
        <div class="card-time">Edited 10 minutes ago</div>
      </div>
    </article>
  `;
}

function renderCards() {
  const items = getStoredItems();
  const pinnedItems = items.filter((item) => item.pinned);
  const otherItems = items.filter((item) => !item.pinned);

  pinnedCardGrid.innerHTML = pinnedItems.map(createCardMarkup).join('');
  otherCardGrid.innerHTML = otherItems.map(createCardMarkup).join('');
}

function showDashboardToast(message) {
  dashboardToast.textContent = message;
  dashboardToast.classList.add('show');

  clearTimeout(dashboardToastTimer);
  dashboardToastTimer = setTimeout(hideDashboardToast, 2500);
}

function hideDashboardToast() {
  dashboardToast.classList.remove('show');
}

function closeAllCardMenus() {
  document.querySelectorAll('.card-menu.open').forEach((cardMenu) => {
    cardMenu.classList.remove('open');
  });
}

function getCardItem(cardElement) {
  return {
    name: cardElement.dataset.name,
    pinned: cardElement.dataset.pinned === 'true',
  };
}

function updateCardItem(cardElement, updateItem) {
  const matchingItem = getCardItem(cardElement);
  const items = getStoredItems();
  const itemIndex = items.findIndex((item) => (
    item.name === matchingItem.name && item.pinned === matchingItem.pinned
  ));

  if (itemIndex !== -1) {
    updateItem(items, itemIndex);
    saveItems(items);
    renderCards();
  }
}

function toggleCardPin(cardElement) {
  updateCardItem(cardElement, (items, itemIndex) => {
    items[itemIndex].pinned = !items[itemIndex].pinned;
  });

  const wasPinned = cardElement.dataset.pinned === 'true';
  showDashboardToast(`${dashboardNoun} ${wasPinned ? 'unpinned' : 'pinned'}.`);
}

function deleteCard(cardElement) {
  updateCardItem(cardElement, (items, itemIndex) => {
    items.splice(itemIndex, 1);
  });

  showDashboardToast(`${dashboardNoun} deleted.`);
}

function handleCardAction(event) {
  const actionButton = event.target.closest('[data-action]');

  if (!actionButton) {
    return;
  }

  const cardElement = actionButton.closest('.dashboard-card');

  if (actionButton.dataset.action === 'pin') {
    toggleCardPin(cardElement);
  }

  if (actionButton.dataset.action === 'delete') {
    deleteCard(cardElement);
  }
}

function handleMenuToggle(event) {
  const toggleButton = event.target.closest('.menu-toggle');

  if (!toggleButton) {
    return;
  }

  closeAllCardMenus();
  toggleButton.nextElementSibling.classList.add('open');
}

function handleDashboardClick(event) {
  if (event.target.closest('.close-menu')) {
    event.target.closest('.card-menu').classList.remove('open');
    return;
  }

  if (event.target.closest('[data-action]')) {
    handleCardAction(event);
    return;
  }

  if (event.target.closest('.menu-toggle')) {
    handleMenuToggle(event);
    return;
  }

  if (!event.target.closest('.card-menu')) {
    closeAllCardMenus();
  }
}

function closeCreateModal(modalBackdrop) {
  modalBackdrop.remove();
}

function showModalError(modalBackdrop) {
  const errorElement = modalBackdrop.querySelector('.modal-error');

  errorElement.textContent = `Enter at least 2 characters for the ${dashboardNoun.toLowerCase()} name.`;
}

function createDashboardItem(name) {
  const items = getStoredItems();

  items.push({ pinned: false, name });
  saveItems(items);
  renderCards();
  showDashboardToast(`${dashboardNoun} created.`);
}

function handleModalSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const modalBackdrop = form.closest('.modal-backdrop');
  const nameInput = form.querySelector('.modal-input');
  const name = nameInput.value.trim();

  if (name.length < 2) {
    showModalError(modalBackdrop);
    nameInput.focus();
    return;
  }

  createDashboardItem(name);
  closeCreateModal(modalBackdrop);
}

function createModalMarkup() {
  return `
    <section class="create-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-top">
        <div>
          <h2 class="modal-title" id="modal-title">Create ${dashboardNoun}</h2>
          <p class="modal-copy">Give your new ${dashboardNoun.toLowerCase()} a name to get started.</p>
        </div>
        <button class="modal-close" type="button" aria-label="Close">×</button>
      </div>
      <form class="create-form" novalidate>
        <label class="modal-label" for="new-item-name">${dashboardNoun} name</label>
        <input class="modal-input" id="new-item-name" type="text" maxlength="60" placeholder="Name your ${dashboardNoun.toLowerCase()}" aria-describedby="new-item-error" />
        <p class="modal-error" id="new-item-error" aria-live="polite"></p>
        <div class="modal-actions">
          <button class="modal-cancel" type="button">Cancel</button>
          <button class="modal-submit" type="submit">Create ${dashboardNoun}</button>
        </div>
      </form>
    </section>
  `;
}

function handleModalClick(event) {
  const modalBackdrop = event.currentTarget;

  if (event.target === modalBackdrop) {
    closeCreateModal(modalBackdrop);
  }
}

function handleModalKeydown(event) {
  if (event.key === 'Escape') {
    closeCreateModal(event.currentTarget);
  }
}

function openCreateModal() {
  const modalBackdrop = document.createElement('div');

  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = createModalMarkup();
  document.body.append(modalBackdrop);

  modalBackdrop.querySelector('.modal-input').focus();
  modalBackdrop.querySelector('.modal-close').addEventListener('click', () => {
    closeCreateModal(modalBackdrop);
  });
  modalBackdrop.querySelector('.modal-cancel').addEventListener('click', () => {
    closeCreateModal(modalBackdrop);
  });
  modalBackdrop.querySelector('.create-form').addEventListener('submit', handleModalSubmit);
  modalBackdrop.addEventListener('click', handleModalClick);
  modalBackdrop.addEventListener('keydown', handleModalKeydown);
}

function initializeDashboard() {
  renderCards();
  document.addEventListener('click', handleDashboardClick);
  document.querySelector('.create-button').addEventListener('click', openCreateModal);
}

initializeDashboard();
