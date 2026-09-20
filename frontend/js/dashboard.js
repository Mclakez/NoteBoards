import { api } from "./api.js";

const dashboard = document.body
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

async function getNotes() {
  const notes = await api.get('/noteCanvas')
  return notes
}

async function getBoards() {
  const boards = await api.get('/boardCanvas')
  return boards
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

function formatEditedTime(value) {
  const timestamp = new Date(value || Date.now()).getTime();

  if (!Number.isFinite(timestamp)) {
    return 'Edited just now';
  }

  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 1) {
    return 'Edited just now';
  }

  if (diffMinutes < 60) {
    return `Edited ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `Edited ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `Edited ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function createCardMarkup(item) {
  const pinActionLabel = item.pinned ? 'Unpin' : 'Pin';

  return `
    <article class="dashboard-card" data-name="${item.title}" data-pinned="${item.pinned}" data-id="${item._id}">
      <div class="card-preview ${dashboardKind}-preview">${item.thumbnail_url ? `<img src="${item.thumbnail_url}">` : getPreviewMarkup()}</div>
      <button class="menu-toggle" type="button" aria-label="Open ${dashboardNoun} menu">•••</button>
      <div class="card-menu">
        <button class="close-menu" type="button" aria-label="Close menu">×</button>
        <button type="button" data-action="pin"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 16V21" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 5.2918C8 5.02079 8 4.88529 8.01312 4.77132C8.1194 3.84789 8.84789 3.1194 9.77133 3.01312C9.88529 3 10.0208 3 10.2918 3H13.7082C13.9792 3 14.1147 3 14.2287 3.01312C15.1521 3.1194 15.8806 3.84789 15.9869 4.77132C16 4.88529 16 5.02079 16 5.2918C16 5.37885 16 5.42237 15.9967 5.46264C15.9708 5.78281 15.7927 6.07104 15.5179 6.2374C15.4834 6.25832 15.4444 6.27779 15.3666 6.31672L15.1055 6.44726C14.7021 6.64897 14.5003 6.74983 14.3681 6.90564C14.26 7.03286 14.1856 7.18509 14.1515 7.34846C14.1097 7.54854 14.1539 7.76968 14.2424 8.21197L15 12H15.3333C15.9533 12 16.2633 12 16.5176 12.0681C17.2078 12.2531 17.7469 12.7922 17.9319 13.4824C18 13.7367 18 14.0467 18 14.6667C18 14.9767 18 15.1317 17.9659 15.2588C17.8735 15.6039 17.6039 15.8735 17.2588 15.9659C17.1317 16 16.9767 16 16.6667 16H7.33333C7.02334 16 6.86835 16 6.74118 15.9659C6.39609 15.8735 6.12654 15.6039 6.03407 15.2588C6 15.1317 6 14.9767 6 14.6667C6 14.0467 6 13.7367 6.06815 13.4824C6.25308 12.7922 6.79218 12.2531 7.48236 12.0681C7.73669 12 8.04669 12 8.66667 12H9L9.75761 8.21197C9.84606 7.76968 9.89029 7.54854 9.84852 7.34846C9.81441 7.18509 9.73995 7.03286 9.63194 6.90564C9.49965 6.74983 9.29794 6.64897 8.89452 6.44726L8.63344 6.31672C8.55558 6.27779 8.51665 6.25832 8.48208 6.2374C8.20731 6.07104 8.02917 5.78281 8.00326 5.46264C8 5.42237 8 5.37885 8 5.2918Z" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
 ${pinActionLabel}</button>
        <button type="button" data-action="delete"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.875 5.0415L17.3069 14.2312C17.1617 16.579 17.0892 17.753 16.5007 18.5971C16.2097 19.0143 15.8351 19.3665 15.4006 19.6312C14.5219 20.1665 13.3457 20.1665 10.9933 20.1665C8.63786 20.1665 7.46011 20.1665 6.5808 19.6302C6.14607 19.3651 5.77133 19.0122 5.48046 18.5942C4.89214 17.7489 4.82116 16.5733 4.67923 14.2221L4.125 5.0415" stroke="#141B34" stroke-width="1.5" stroke-linecap="round"/>
<path d="M2.75 5.04183H19.25M14.7177 5.04183L14.092 3.75092C13.6763 2.8934 13.4684 2.46464 13.1099 2.19724C13.0304 2.13792 12.9462 2.08516 12.8581 2.03947C12.4611 1.8335 11.9846 1.8335 11.0316 1.8335C10.0547 1.8335 9.56633 1.8335 9.16271 2.04811C9.07326 2.09567 8.9879 2.15057 8.90752 2.21224C8.54484 2.49047 8.34224 2.93492 7.93706 3.82382L7.38184 5.04183" stroke="#141B34" stroke-width="1.5" stroke-linecap="round"/>
<path d="M8.70898 15.125V9.625" stroke="#141B34" stroke-width="1.5" stroke-linecap="round"/>
<path d="M13.291 15.125V9.625" stroke="#141B34" stroke-width="1.5" stroke-linecap="round"/>
</svg>
 Delete</button>
      </div>
      <div class="card-meta">
        <div class="card-title">${item.title}</div>
        <div class="card-time">${formatEditedTime(item.updatedAt || item.updated_at)}</div>
      </div>
    </article>
  `;
}

async function renderCards() {
  let items;

  if (dashboardKind === 'note') {
    items = await getNotes();
  } else {
    items = await getBoards();
  }

  items = [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.updated_at || 0).getTime();
    const bTime = new Date(b.updatedAt || b.updated_at || 0).getTime();
    return bTime - aTime;
  });

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

// async function updateCardItem(cardElement, updateItem) {
//   const matchingItem = getCardItem(cardElement);
//   const items = getStoredItems();
//   const itemIndex = items.findIndex((item) => (
//     item.name === matchingItem.name && item.pinned === matchingItem.pinned
//   ));

//   if (itemIndex !== -1) {
//     updateItem(items, itemIndex);
//     saveItems(items);
//     await renderCards();
//   }
// }

async function toggleCardPin(cardId, cardPin) {
  // updateCardItem(cardElement, (items, itemIndex) => {
  //   items[itemIndex].pinned = !items[itemIndex].pinned;
  // });

  if(dashboardKind === "note") {
    const pinnedCard = await api.patch(`/noteCanvas/update/${cardId}`, {
    pinned: !cardPin
  })
  console.log(pinnedCard)
  } else {
   const pinnedCard = await api.patch(`/boardCanvas/update/${cardId}`, {
    pinned: !cardPin
  })
  console.log(pinnedCard)
  }
  await renderCards()

  const wasPinned = cardPin === 'true';
  showDashboardToast(`${dashboardNoun} ${wasPinned ? 'unpinned' : 'pinned'}.`);
}

async function deleteCard(cardId) {
  if(dashboardKind === "note") {
    const deletedCard = await api.delete(`/noteCanvas/${cardId}`)
  } else {
    const deletedCard = await api.delete(`/boardCanvas/${cardId}`)
  }
  
  // updateCardItem(cardElement, (items, itemIndex) => {
  //   items.splice(itemIndex, 1);
  // });
  await renderCards()
  showDashboardToast(`${dashboardNoun} deleted.`);
}

dashboard.addEventListener('click', (e) => {
  const canvas = e.target.closest('.dashboard-card')
  if (e.target.closest('.menu-toggle') || e.target.closest('.card-menu')) return
  if(!canvas) return
  handleCardClick(canvas)
})

async function handleCardClick(canvas) {
  const canvasId = canvas.dataset.id
  if (dashboardKind === "note") {
     window.location.href = `./note-canvas.html?canvasId=${encodeURIComponent(canvasId)}`
  } else {
     window.location.href = `./board-canvas.html?canvasId=${encodeURIComponent(canvasId)}`
  }
 
}

async function handleCardAction(event) {
  const actionButton = event.target.closest('[data-action]');

  if (!actionButton) {
    return;
  }

  const cardElement = actionButton.closest('.dashboard-card');
  const cardId = cardElement.dataset.id
  const cardPin = cardElement.dataset.pinned === "true"
  console.log(cardPin);
  

  if (actionButton.dataset.action === 'pin') {

    await toggleCardPin(cardId, cardPin);
  }

  if (actionButton.dataset.action === 'delete') {
    await deleteCard(cardId);
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

 async function createDashboardItem(title) {
  if(dashboardKind === "note") {
    const card = await api.post('/noteCanvas', {
    title
  } )
  } else {
    const card = await api.post('/boardCanvas', {
    title
  } )
  }
  
  await renderCards();
  showDashboardToast(`${dashboardNoun} created.`);
}
// create card
function handleModalSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const modalBackdrop = form.closest('.modal-backdrop');
  const nameInput = form.querySelector('.modal-input');
  const title = nameInput.value.trim();

  if (title.length < 2) {
    showModalError(modalBackdrop);
    nameInput.focus();
    return;
  }

  createDashboardItem(title);
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

async function initializeDashboard() {
  await renderCards();
  document.addEventListener('click', handleDashboardClick);
  document.querySelector('.create-button').addEventListener('click', openCreateModal);
}

initializeDashboard();
