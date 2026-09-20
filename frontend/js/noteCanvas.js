import { api } from "./api.js";

const colorBtns = document.querySelectorAll('.color_btn')
const addCardBtn = document.querySelector('.create-button')
const canvas = document.getElementById('canvas')
const viewport = document.getElementById('viewport')
const canvasId = new URLSearchParams(window.location.search).get('canvasId')
const title = document.querySelector('h1')

let thumbnailTimer = null
let selectedCardId = null;
let currentCard;
let offsetX, offsetY;
let canvasOffsetX, canvasOffsetY;
let translateX = 0
let translateY = 0
let panStartMouseX, panStartMouseY;
let panStartTranslateX, panStartTranslateY;
let panStartScrollLeft, panStartScrollTop;
let isDragging = false
let isPanning = false
let highestZIndex = 1;
let panStartX, panStartY;

viewport.scrollLeft = (10000 - window.innerWidth) / 2
viewport.scrollTop = (10000 - window.innerHeight) / 2

async function loadNotes() {
    const data = await api.get(`/noteCanvas/${canvasId}`)
    title.textContent = data.canvas.title
    const noteCards = data.notes
    canvas.innerHTML = "";
    console.log(noteCards)
    noteCards.forEach(noteCard => {
        loadCards(noteCard)
    })
    syncSelectedCard()
}

loadNotes()

function syncSelectedCard() {
    document.querySelectorAll('.note_wrapper').forEach(card => {
        card.classList.toggle('selected', card.dataset.cardId === selectedCardId);
    });
}

addCardBtn.addEventListener('click', createCard)

document.addEventListener("pointerdown", (e) => {
    if (e.target.closest('.btns_container')) return
    if (e.target.closest('article')) return
    const content = e.target.closest('.note_content');
    if (content) return;
    const card = e.target.closest('.note_wrapper')
    if(!card) return
    const handle = e.target.closest('.handle');
    if (handle) {
        e.stopPropagation();
        return;
    }
    if (e.target.closest('button')) return
    isDragging = true
    const rect = card.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY= e.clientY - rect.top
    currentCard = card
    currentCard.classList.add('selected')
    card.setPointerCapture(e.pointerId)
})

viewport.addEventListener('pointerdown', (e) => {
    // Only left-click, and ignore cards / UI buttons
     if (e.button !== 0) return
    if (e.target.closest('.btns_container')) return
    if (e.target.closest('article')) return
    if (e.target.closest('.note_wrapper')) return
    if (e.target.closest('.btns_container')) return
    if (e.target.closest('article')) return
    const cards = document.querySelectorAll('.note_wrapper')
    cards.forEach(card => {
        card.classList.remove('selected')
    })

    isPanning = true
    panStartX = e.clientX
    panStartY = e.clientY
    panStartScrollLeft = viewport.scrollLeft
    panStartScrollTop = viewport.scrollTop
    viewport.style.cursor = 'grabbing'
    e.preventDefault()
})

document.addEventListener("pointermove", (e) => {
    if(!isPanning) return

    const dx = e.clientX - panStartX
    const dy = e.clientY - panStartY

    let newLeft = panStartScrollLeft - dx
    let newTop = panStartScrollTop - dy

    const maxScrollLeft = canvas.scrollWidth - viewport.clientWidth
    const maxScrollTop = canvas.scrollHeight - viewport.clientHeight

    // Hard clamp so edges never show
    viewport.scrollLeft = Math.max(0, Math.min(maxScrollLeft, newLeft))
    viewport.scrollTop = Math.max(0, Math.min(maxScrollTop, newTop))
})



document.addEventListener("pointermove", (e) => {
    if(!isDragging) return
    canvas.style.cursor = 'grabbing'
    const rect = canvas.getBoundingClientRect()

    let left = Math.max(0, Math.min(e.clientX - rect.left - offsetX, canvas.clientWidth - currentCard.offsetWidth));
    let top = Math.max(0, Math.min(e.clientY - rect.top - offsetY, canvas.clientHeight - currentCard.offsetHeight));

    currentCard.style.left = `${left}px`
    currentCard.style.top = `${top}px`

    e.preventDefault()
})


//delete card
document.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete_btn');
    if (!deleteBtn) return;
    
    const card = deleteBtn.closest('.note_wrapper');
    const cardId = card.dataset.cardId
    console.log(deleteBtn);
    // card.remove()
    
    if (card) {
        const deletedCard = await api.delete(`/noteCard/${canvasId}/${cardId}`)
        console.log(deletedCard)
        await loadNotes()
    }
    
});

document.addEventListener('keydown',async (e) => {
    if (e.key === 'Delete') {
        const selected = document.querySelector('.note_wrapper.selected');
        if(!selected) return
        const cardId = selected.dataset.cardId
        if (!e.target.closest('.note_content')) {
        const deletedCard = await api.delete(`/noteCard/${canvasId}/${cardId}`)
        console.log(deletedCard)
        await loadNotes()
        }
    }
});

document.addEventListener('click', (e) => {
    const card = e.target.closest('.note_wrapper')
    if(!card) return
    const cards = document.querySelectorAll('.note_wrapper')
    cards.forEach(card => {
        card.classList.remove('selected')
    })
    card.classList.add('selected')
    selectedCardId = card.dataset.cardId
})

document.addEventListener("click", async (e) => {
        const indexBtn = e.target.closest(".index_btn");
        if (!indexBtn) return;
        const card = indexBtn.closest(".note_wrapper");
        if (!card) return;
        const cardId = card.dataset.cardId

        // bring to front
        highestZIndex++;
        const updatedZCard = await api.patch(`/noteCard/${canvasId}/${cardId}`, {
            z_index: highestZIndex
        })
        await loadNotes()

        // select it
        document.querySelectorAll(".note_wrapper").forEach((c) => {
          c.classList.remove("selected");
        });
        card.classList.add("selected");

        e.stopPropagation(); // prevent card selection from interfering
      });



document.addEventListener('pointerup', async (e) => {
    canvas.style.cursor = 'default'
    //keeps the card from moving on color change
    if (!isDragging || !currentCard) {
        isDragging = false
        isPanning = false
        return
    }

    isDragging = false
    isPanning = false
    const rect = canvas.getBoundingClientRect()

    let left = Math.max(0, Math.min(e.clientX - rect.left - offsetX, canvas.clientWidth - currentCard.offsetWidth));
    let top = Math.max(0, Math.min(e.clientY - rect.top - offsetY, canvas.clientHeight - currentCard.offsetHeight)); 
    const currentCardId = currentCard.dataset.cardId
    const updatedCard = await api.patch(`/noteCard/${canvasId}/${currentCardId}`, {
        x: left,
        y: top
    })
    scheduleScreenshotTimer()
    e.preventDefault()
})

//handling card resizing
document.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('.handle');
    if (!handle) return;

    e.stopPropagation();

    // target the wrapper, not just the card
    const wrapper = handle.closest('.note_wrapper');
    const cardId = wrapper.dataset.cardId
    if (!cardId) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = wrapper.offsetWidth;
    const startHeight = wrapper.offsetHeight;
    const startLeft = parseInt(wrapper.style.left) || 0;
    const startTop = parseInt(wrapper.style.top) || 0;

    const isRight = handle.classList.contains('top_right') || handle.classList.contains('bottom_right');
    const isLeft = handle.classList.contains('top_left') || handle.classList.contains('bottom_left');
    const isBottom = handle.classList.contains('bottom_left') || handle.classList.contains('bottom_right');
    const isTop = handle.classList.contains('top_left') || handle.classList.contains('top_right');

    function onResizeMove(ev) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (isRight) {
            wrapper.style.width = `${Math.max(150, startWidth + dx)}px`;
        }

        if (isLeft) {
            const newWidth = Math.max(150, startWidth - dx);
            wrapper.style.width = `${newWidth}px`;
            // move card left to simulate left-edge resize
            wrapper.style.left = `${startLeft + (startWidth - newWidth)}px`;
        }

        if (isBottom) {
            wrapper.style.height = `${Math.max(100, startHeight + dy)}px`;
        }

        if (isTop) {
            const newHeight = Math.max(100, startHeight - dy);
            wrapper.style.height = `${newHeight}px`;
            wrapper.style.top = `${startTop + (startHeight - newHeight)}px`;
        }
    }


    async function onResizeUp() {
        const updatedSizeCard = await api.patch(`/noteCard/${canvasId}/${cardId}`, {
            height: Number.parseFloat(wrapper.style.height),
            width: Number.parseFloat(wrapper.style.width),
            x: Number.parseFloat(wrapper.style.left),
            y: Number.parseFloat(wrapper.style.top)
        })

        console.log(updatedSizeCard)
        scheduleScreenshotTimer()
        document.removeEventListener('pointermove', onResizeMove);
        document.removeEventListener('pointerup', onResizeUp);
    }

    document.addEventListener('pointermove', onResizeMove);
    document.addEventListener('pointerup', onResizeUp);
});



//loading the cards
async function loadCards(noteCard) {
    let card = document.createElement('div')
    card.classList.add('note_wrapper')
    card.dataset.cardId = noteCard._id

    card.innerHTML = `
        <div class="note_card">
            <span class="handle top_left"></span>
            <span class="handle top_right"></span>
            <span class="handle bottom_left"></span>
            <span class="handle bottom_right"></span>
            <div class="note_header">
                <button class="index_btn">
                    <img src="./images/arrow-up-double.svg">
                </button>

                <button class="delete_btn">
                    <img src="./images/delete-02 (1).svg">
                </button>
            </div>

            <div class="note_content" contenteditable="true">
            </div>
        </div>
    `

    const content = card.querySelector('.note_content')
    const header = card.querySelector('.note_header')
    card.style.height = `${noteCard.height}px`
    card.style.width = `${noteCard.width}px`
    card.style.zIndex = noteCard.z_index
    highestZIndex = Math.max(highestZIndex, noteCard.z_index)
    header.style.backgroundColor = darkenColor(noteCard.color)
    content.style.backgroundColor = noteCard.color
    content.textContent = noteCard.content

    

    // card.style.left = `${viewport.scrollLeft + window.innerWidth / 2 - 200}px`
    // card.style.top = `${viewport.scrollTop + window.innerHeight / 2 - 100}px`

    card.style.left = `${noteCard.x}px`
    card.style.top = `${noteCard.y}px`
    let saveTimeOut;

    content.addEventListener('input', async () => {
        
        const text = content.textContent.trim()
        const cardId = card.dataset.cardId
        clearTimeout(saveTimeOut)
        saveTimeOut = setTimeout(async () => {
           try {
            const updatedTextCard = await api.patch(`/noteCard/${canvasId}/${cardId}`, {
                content: text
            })
            scheduleScreenshotTimer()
           } catch (error) {
                console.error('Failed to save note content:', error)
           }
        }, 300)
    })

    canvas.appendChild(card)
}



//create a single card
async function createCard() {
    const notes = await api.post(`/noteCard/${canvasId}`, {
        canvasId,
        x : viewport.scrollLeft + window.innerWidth / 2 - 200,
        y: viewport.scrollTop + window.innerHeight / 2 - 100
    })

    await loadNotes()
    scheduleScreenshotTimer()
}


function darkenColor(hex) {
    let r = parseInt(hex.slice(1, 3), 16)
    let g = parseInt(hex.slice(3, 5), 16)
    let b = parseInt(hex.slice(5, 7), 16)
    r = Math.floor(r * 0.5)
    g = Math.floor(g * 0.5)
    b = Math.floor(b * 0.5)
    return `rgb(${r}, ${g}, ${b})`
}

//change card color
colorBtns.forEach(colorBtn => {
    let color = colorBtn.getAttribute('data-color')
    colorBtn.style.backgroundColor = color

    colorBtn.addEventListener('click',async (e) => {
        e.preventDefault()
        e.stopPropagation()
        const selected = document.querySelector('.selected')
        if(!selected) return
        const cardId = selected.dataset.cardId
        const updatedColorCard = await api.patch(`/noteCard/${canvasId}/${cardId}`, {
            color
        })
        
        await loadNotes()
    })
})


async function saveScreenshot() {
    const cards = document.querySelectorAll('.note_wrapper')
    if (cards.length === 0) return

    // find bounding box of all cards
    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    cards.forEach(card => {
        const left = parseInt(card.style.left) || 0
        const top = parseInt(card.style.top) || 0
        const right = left + card.offsetWidth
        const bottom = top + card.offsetHeight

        if (left < minX) minX = left
        if (top < minY) minY = top
        if (right > maxX) maxX = right
        if (bottom > maxY) maxY = bottom
    })

    const padding = 40
    
    const screenshotCanvas = await html2canvas(canvas, {
        x: minX - padding,
        y: minY - padding,
        width: (maxX - minX) + padding * 2,
        height: (maxY - minY) + padding * 2,
        scale: Math.min(window.devicePixelRatio || 1, 2),
        useCORS: true,
        logging: false,
        backgroundColor: '#f5f5f5'
    })

    screenshotCanvas.toBlob(async (blob) => {
        const formData = new FormData()
        formData.append('thumbnail', blob, 'thumbnail.png')
        console.log(blob)
        try {
            await api.post(`/noteCanvas/${canvasId}/thumbnail`, formData)
        } catch (err) {
            console.error('Thumbnail save failed:', err)
        }
    }, 'image/png')
}

document.querySelector('.back_btn').addEventListener('click', async (e) => {
    e.preventDefault()
    const screen = await saveScreenshot()
    window.location.href = 'notes.html'
})


//Make screenshots
function scheduleScreenshotTimer() {
    clearTimeout(thumbnailTimer)
    thumbnailTimer = setTimeout(async () => {
        try {
            await saveScreenshot()
            console.log("Thumbnail updated in Cloudinary")
        } catch (error) {
             console.error('Failed to auto-save thumbnail:', error)
        }
    }, 1000)
}