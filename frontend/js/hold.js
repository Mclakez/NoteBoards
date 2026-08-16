const colorBtns = document.querySelectorAll('.color_btn')
const addCardBtn = document.querySelector('.create-button')
const canvas = document.getElementById('canvas')
const viewport = document.getElementById('viewport')

let currentCard;
let offsetX, offsetY;
let canvasOffsetX, canvasOffsetY;
let translateX = 0
let translateY = 0
let panStartMouseX, panStartMouseY;
let panStartTranslateX, panStartTranslateY;
let isDragging = false
let isPanning = false
let highestZIndex = 1;
let panStartX, panStartY;

viewport.scrollLeft = (10000 - window.innerWidth) / 2
viewport.scrollTop = (10000 - window.innerHeight) / 2


colorBtns.forEach(colorBtn => {
    let color = colorBtn.getAttribute('data-color')
    colorBtn.style.backgroundColor = color
    colorBtn.addEventListener('click', () => {
        const selected = document.querySelector('.selected')
        if(selected) {
            selected.querySelector('.note_content').style.backgroundColor = color
        }
    })
})

addCardBtn.addEventListener('click', createCard)

document.addEventListener("pointerdown", (e) => {
    const card = e.target.closest('.note_wrapper')
    if(!card) return
    isDragging = true
    const rect = card.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY= e.clientY - rect.top
    currentCard = card
    card.setPointerCapture(e.pointerId)
    console.log("card down");
})

// viewport.addEventListener('pointerdown', (e) => {
//     const card = e.target.closest('.note_wrapper')
//     if(card) return
//     isPanning = true
//     canvas.style.cursor = 'grabbing'
//     const rect = canvas.getBoundingClientRect()
//     panStartMouseX = e.clientX
//     panStartMouseY = e.clientY
//     panStartTranslateX = translateX
//     panStartTranslateY = translateY
//     // canvasOffsetX = e.clientX - rect.left
//     // canvasOffsetY= e.clientY - rect.top
//     viewport.setPointerCapture(e.pointerId)
//     console.log("canvas down");
// })


// document.addEventListener("pointermove", (e) => {
//     if(!isPanning) return
//     canvas.style.cursor = 'grabbing'
//     const dx = e.clientX - panStartMouseX
//     const dy = e.clientY - panStartMouseY

//    let newTranslateX = panStartTranslateX + dx
//     let newTranslateY = panStartTranslateY + dy

//     // --- CLAMPING LOGIC ---
//     // Get the current visible area relative to the scroll position
//     const scrollLeft = viewport.scrollLeft;
//     const scrollTop = viewport.scrollTop;
//     const viewWidth = viewport.clientWidth;
//     const viewHeight = viewport.clientHeight;
//     const canvasWidth = canvas.clientWidth;
//     const canvasHeight = canvas.clientHeight;

//     // Calculate the boundaries for the translation (in canvas coordinates)
//     // We want the visible viewport to stay strictly inside the canvas area [0, canvasWidth] x [0, canvasHeight]
//     const minTranslateX = -(scrollLeft);
//     const maxTranslateX = (canvasWidth - viewWidth) - scrollLeft;
    
//     const minTranslateY = -(scrollTop);
//     const maxTranslateY = (canvasHeight - viewHeight) - scrollTop;

//     // Clamp the translations
//     newTranslateX = Math.max(minTranslateX, Math.min(maxTranslateX, newTranslateX));
//     newTranslateY = Math.max(minTranslateY, Math.min(maxTranslateY, newTranslateY));
//     // ---------------------

//     translateX = newTranslateX
//     translateY = newTranslateY
//     canvas.style.transform = `translate(${translateX}px, ${translateY}px)`

//     viewport.scrollLeft += (panStartTranslateX - translateX);
//     viewport.scrollTop += (panStartTranslateY - translateY);
    
//     // Update the starting values for the next move event
//     panStartTranslateX = translateX;
//     panStartTranslateY = translateY;
//     panStartMouseX = e.clientX;
//     panStartMouseY = e.clientY;
//     console.log("canvas move");
// })

// document.addEventListener("pointermove", (e) => {
//     if(!isPanning) return
//     viewport.style.cursor = 'grabbing'
//     const dx = e.clientX - panStartMouseX
//     const dy = e.clientY - panStartMouseY

//     let newScrollLeft = panStartScrollLeft - dx
//     let newScrollTop = panStartScrollTop - dy

//     // --- CLAMPING: Keep viewport strictly inside canvas ---
//     const maxScrollLeft = canvas.clientWidth - viewport.clientWidth
//     const maxScrollTop = canvas.clientHeight - viewport.clientHeight

//     viewport.scrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft))
//     viewport.scrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop))
// })

viewport.addEventListener('pointerdown', (e) => {
    // Only left-click, and ignore cards / UI buttons
    if (e.button !== 0) return
    if (e.target.closest('.note_wrapper')) return
    if (e.target.closest('.btns_container')) return
    if (e.target.closest('article')) return

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
    console.log("card move", rect);
})

document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.note_header button:last-child');
    if (!deleteBtn) return;
    
    const card = deleteBtn.closest('.note_wrapper');
    console.log(deleteBtn);
    
    if (card) {
        card.remove();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete') {
        const selected = document.querySelector('.note_wrapper.selected');
        if (selected && !e.target.closest('.note_content')) {
            selected.remove();
            e.preventDefault();
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
})



document.addEventListener('pointerup', (e) => {
    canvas.style.cursor = 'default'
    isDragging = false
    isPanning = false
})


document.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('.handle');
    if (!handle) return;
    
    e.stopPropagation();
    const card = handle.closest('.note_card');
    const content = card.querySelector('.note_content');
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = content.offsetWidth;
    const startHeight = content.offsetHeight;
    
    const isRight = handle.classList.contains('top_right') || handle.classList.contains('bottom_right');
    const isBottom = handle.classList.contains('bottom_left') || handle.classList.contains('bottom_right');
    
    function onResizeMove(ev) {
        let newWidth = startWidth;
        let newHeight = startHeight;
        
        if (isRight) {
            newWidth = Math.max(100, startWidth + (ev.clientX - startX));
        } else {
            newWidth = Math.max(100, startWidth - (ev.clientX - startX));
        }
        
        if (isBottom) {
            newHeight = Math.max(80, startHeight + (ev.clientY - startY));
        } else {
            newHeight = Math.max(80, startHeight - (ev.clientY - startY));
        }
        
        card.style.width = `${newWidth}px`;
        card.style.height = `${newHeight}px`;
    }
    
    function onResizeUp() {
        document.removeEventListener('pointermove', onResizeMove);
        document.removeEventListener('pointerup', onResizeUp);
    }
    
    document.addEventListener('pointermove', onResizeMove);
    document.addEventListener('pointerup', onResizeUp);
});



function createCard() {
    let card = document.createElement('div')
    card.classList.add('note_wrapper')
    card.innerHTML = `
        <div class="note_card">
            <span class="handle top_left"></span>
            <span class="handle top_right"></span>
            <span class="handle bottom_left"></span>
            <span class="handle bottom_right"></span>
            <div class="note_header">
                <button>
                    <img src="./images/arrow-up-double.svg">
                </button>

                <button>
                    <img src="./images/delete-02 (1).svg">
                </button>
            </div>

            <div class="note_content" contenteditable="true">

            </div>
        </div>
    `
    card.style.left = `${viewport.scrollLeft + window.innerWidth / 2 - 200}px`
    card.style.top = `${viewport.scrollTop + window.innerHeight / 2 - 100}px`

    canvas.appendChild(card)
}
