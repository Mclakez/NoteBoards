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
let panStartScrollLeft, panStartScrollTop;
let isDragging = false
let isPanning = false
let highestZIndex = 1;
let panStartX, panStartY;

viewport.scrollLeft = (10000 - window.innerWidth) / 2
viewport.scrollTop = (10000 - window.innerHeight) / 2

addCardBtn.addEventListener('click', createCard)

document.addEventListener("pointerdown", (e) => {
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
    console.log("card move", rect);
})

document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete_btn');
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

document.addEventListener("click", (e) => {
        const indexBtn = e.target.closest(".index_btn");
        if (!indexBtn) return;
        const card = indexBtn.closest(".note_wrapper");
        if (!card) return;

        // bring to front
        highestZIndex++;
        card.style.zIndex = highestZIndex;

        // select it
        document.querySelectorAll(".note_wrapper").forEach((c) => {
          c.classList.remove("selected");
        });
        card.classList.add("selected");

        e.stopPropagation(); // prevent card selection from interfering
      });



document.addEventListener('pointerup', (e) => {
    canvas.style.cursor = 'default'
    isDragging = false
    isPanning = false
})


document.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('.handle');
    if (!handle) return;

    e.stopPropagation();

    // target the wrapper, not just the card
    const wrapper = handle.closest('.note_wrapper');
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

    card.style.left = `${viewport.scrollLeft + window.innerWidth / 2 - 200}px`
    card.style.top = `${viewport.scrollTop + window.innerHeight / 2 - 100}px`

    canvas.appendChild(card)
}


function darkenColor(hex) {
    let r = parseInt(hex.slice(1, 3), 16)
    let g = parseInt(hex.slice(3, 5), 16)
    let b = parseInt(hex.slice(5, 7), 16)
    r = Math.floor(r * 0.75)
    g = Math.floor(g * 0.75)
    b = Math.floor(b * 0.75)
    return `rgb(${r}, ${g}, ${b})`
}


colorBtns.forEach(colorBtn => {
    let color = colorBtn.getAttribute('data-color')
    colorBtn.style.backgroundColor = color

    colorBtn.addEventListener('click', () => {
        const selected = document.querySelector('.selected')
        if (selected) {
            selected.querySelector('.note_content').style.backgroundColor = color
            selected.querySelector('.note_header').style.backgroundColor = darkenColor(color)
        }
    })
})