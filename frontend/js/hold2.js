const colourButtons = document.querySelectorAll('.color_btn');
const addCardButton = document.querySelector('.create-button');
const canvas = document.querySelector('#canvas');
const viewport = document.querySelector('#viewport');

const canvasSize = 10000;
const handleRadius = 8;
const rotationDeadZone = 12;
const rotationZoneDepth = 48;
const rotationZoneHalfWidth = 20;
const rotationButtonDistance = 29;
const minimumCardWidth = 150;
const minimumCardHeight = 100;

let highestZIndex = 1;
let activeInteraction = null;
let rotationTarget = null;

const rotateButton = createRotateButton();

function createRotateButton() {
    const button = document.createElement('button');

    button.className = 'note_rotate_button';
    button.type = 'button';
    button.hidden = true;
    button.setAttribute('aria-label', 'Rotate note');
    button.textContent = '↻';
    document.body.append(button);

    return button;
}

function initializeViewportPosition() {
    viewport.scrollLeft = (canvasSize - window.innerWidth) / 2;
    viewport.scrollTop = (canvasSize - window.innerHeight) / 2;
}

function getCardRotation(cardElement) {
    return Number(cardElement.dataset.rotation || 0);
}

function setCardRotation(cardElement, rotation) {
    cardElement.dataset.rotation = String(rotation);
    cardElement.style.transform = `rotate(${rotation}deg)`;
}

function getCanvasPointerPosition(event) {
    const canvasBounds = canvas.getBoundingClientRect();

    return {
        x: event.clientX - canvasBounds.left,
        y: event.clientY - canvasBounds.top,
    };
}

function getCardCanvasCenter(cardElement) {
    return {
        x: cardElement.offsetLeft + (cardElement.offsetWidth / 2),
        y: cardElement.offsetTop + (cardElement.offsetHeight / 2),
    };
}

function getCardViewportCenter(cardElement) {
    const canvasBounds = canvas.getBoundingClientRect();
    const center = getCardCanvasCenter(cardElement);

    return {
        x: canvasBounds.left + center.x,
        y: canvasBounds.top + center.y,
    };
}

function rotateVector(vector, degrees) {
    const radians = degrees * (Math.PI / 180);
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    return {
        x: (vector.x * cosine) - (vector.y * sine),
        y: (vector.x * sine) + (vector.y * cosine),
    };
}

function getHandleGeometry(cardElement) {
    const center = getCardViewportCenter(cardElement);
    const halfWidth = cardElement.offsetWidth / 2;
    const halfHeight = cardElement.offsetHeight / 2;
    const rotation = getCardRotation(cardElement);
    const corners = [
        { name: 'top_left', x: -halfWidth, y: -halfHeight },
        { name: 'top_right', x: halfWidth, y: -halfHeight },
        { name: 'bottom_left', x: -halfWidth, y: halfHeight },
        { name: 'bottom_right', x: halfWidth, y: halfHeight },
    ];

    return corners.map((corner) => {
        const rotatedCorner = rotateVector(corner, rotation);
        const length = Math.hypot(rotatedCorner.x, rotatedCorner.y);

        return {
            name: corner.name,
            x: center.x + rotatedCorner.x,
            y: center.y + rotatedCorner.y,
            outwardX: rotatedCorner.x / length,
            outwardY: rotatedCorner.y / length,
        };
    });
}

function getClosestHandle(cardElement, event) {
    const handles = getHandleGeometry(cardElement);
    let closestHandle = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    handles.forEach((handle) => {
        const distance = Math.hypot(event.clientX - handle.x, event.clientY - handle.y);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestHandle = handle;
        }
    });

    return {
        handle: closestHandle,
        distance: closestDistance,
    };
}

function getRotationZonePosition(handle, event) {
    const pointerX = event.clientX - handle.x;
    const pointerY = event.clientY - handle.y;
    const outwardDistance = (pointerX * handle.outwardX) + (pointerY * handle.outwardY);
    const sidewaysDistance = Math.abs(
        (pointerX * -handle.outwardY) + (pointerY * handle.outwardX),
    );

    return {
        outwardDistance,
        sidewaysDistance,
    };
}

function isPointerInRotationZone(handle, event) {
    const zonePosition = getRotationZonePosition(handle, event);

    return (
        zonePosition.outwardDistance > rotationDeadZone &&
        zonePosition.outwardDistance < rotationZoneDepth &&
        zonePosition.sidewaysDistance < rotationZoneHalfWidth
    );
}

function isPointerOnHandle(cardElement, event) {
    const closestHandle = getClosestHandle(cardElement, event);

    return closestHandle.distance <= handleRadius;
}

function showRotateButton(cardElement, handle) {
    rotationTarget = { cardElement, handleName: handle.name };
    rotateButton.style.left = `${handle.x + (handle.outwardX * rotationButtonDistance)}px`;
    rotateButton.style.top = `${handle.y + (handle.outwardY * rotationButtonDistance)}px`;
    rotateButton.style.transform = 'translate(-50%, -50%)';
    rotateButton.hidden = false;
}

function hideRotateButton() {
    rotationTarget = null;
    rotateButton.hidden = true;
}

function updateRotateButtonFromPointer(event) {
    if (activeInteraction) {
        return;
    }

    if (event.target === rotateButton && rotationTarget) {
        return;
    }

    const selectedCard = document.querySelector('.note_wrapper.selected');

    if (!selectedCard || isPointerOnHandle(selectedCard, event)) {
        hideRotateButton();
        return;
    }

    const closestHandle = getClosestHandle(selectedCard, event);

    if (isPointerInRotationZone(closestHandle.handle, event)) {
        showRotateButton(selectedCard, closestHandle.handle);
        return;
    }

    hideRotateButton();
}

function selectCard(cardElement) {
    document.querySelectorAll('.note_wrapper.selected').forEach((selectedCard) => {
        selectedCard.classList.remove('selected');
    });

    cardElement.classList.add('selected');
}

function bringCardToFront(cardElement) {
    highestZIndex += 1;
    cardElement.style.zIndex = String(highestZIndex);
}

function startCardDrag(cardElement, event) {
    const cardCenter = getCardCanvasCenter(cardElement);
    const pointerPosition = getCanvasPointerPosition(event);

    activeInteraction = {
        type: 'drag',
        cardElement,
        captureElement: cardElement,
        startPointer: pointerPosition,
        startCenter: cardCenter,
    };

    selectCard(cardElement);
    bringCardToFront(cardElement);
    cardElement.setPointerCapture(event.pointerId);
    hideRotateButton();
}

function moveCard(event) {
    if (activeInteraction?.type !== 'drag') {
        return;
    }

    const pointerPosition = getCanvasPointerPosition(event);
    const deltaX = pointerPosition.x - activeInteraction.startPointer.x;
    const deltaY = pointerPosition.y - activeInteraction.startPointer.y;
    const cardElement = activeInteraction.cardElement;
    const left = activeInteraction.startCenter.x + deltaX - (cardElement.offsetWidth / 2);
    const top = activeInteraction.startCenter.y + deltaY - (cardElement.offsetHeight / 2);

    cardElement.style.left = `${Math.max(0, Math.min(canvas.clientWidth - cardElement.offsetWidth, left))}px`;
    cardElement.style.top = `${Math.max(0, Math.min(canvas.clientHeight - cardElement.offsetHeight, top))}px`;
}

function getResizeEdges(handleElement) {
    return {
        isLeft: handleElement.classList.contains('top_left') || handleElement.classList.contains('bottom_left'),
        isRight: handleElement.classList.contains('top_right') || handleElement.classList.contains('bottom_right'),
        isTop: handleElement.classList.contains('top_left') || handleElement.classList.contains('top_right'),
        isBottom: handleElement.classList.contains('bottom_left') || handleElement.classList.contains('bottom_right'),
    };
}

function startCardResize(handleElement, event) {
    const cardElement = handleElement.closest('.note_wrapper');

    activeInteraction = {
        type: 'resize',
        cardElement,
        captureElement: handleElement,
        edges: getResizeEdges(handleElement),
        rotation: getCardRotation(cardElement),
        startPointer: { x: event.clientX, y: event.clientY },
        startWidth: cardElement.offsetWidth,
        startHeight: cardElement.offsetHeight,
        startLeft: cardElement.offsetLeft,
        startTop: cardElement.offsetTop,
    };

    selectCard(cardElement);
    bringCardToFront(cardElement);
    handleElement.setPointerCapture(event.pointerId);
    hideRotateButton();
}

function getUnrotatedResizeDelta(event) {
    const pointerDelta = {
        x: event.clientX - activeInteraction.startPointer.x,
        y: event.clientY - activeInteraction.startPointer.y,
    };

    return rotateVector(pointerDelta, -activeInteraction.rotation);
}

function resizeCard(event) {
    if (activeInteraction?.type !== 'resize') {
        return;
    }

    const resizeDelta = getUnrotatedResizeDelta(event);
    const { edges } = activeInteraction;
    let width = activeInteraction.startWidth;
    let height = activeInteraction.startHeight;
    let left = activeInteraction.startLeft;
    let top = activeInteraction.startTop;

    if (edges.isRight) {
        width = Math.max(minimumCardWidth, activeInteraction.startWidth + resizeDelta.x);
    }

    if (edges.isLeft) {
        width = Math.max(minimumCardWidth, activeInteraction.startWidth - resizeDelta.x);
        left = activeInteraction.startLeft + (activeInteraction.startWidth - width);
    }

    if (edges.isBottom) {
        height = Math.max(minimumCardHeight, activeInteraction.startHeight + resizeDelta.y);
    }

    if (edges.isTop) {
        height = Math.max(minimumCardHeight, activeInteraction.startHeight - resizeDelta.y);
        top = activeInteraction.startTop + (activeInteraction.startHeight - height);
    }

    activeInteraction.cardElement.style.width = `${width}px`;
    activeInteraction.cardElement.style.height = `${height}px`;
    activeInteraction.cardElement.style.left = `${left}px`;
    activeInteraction.cardElement.style.top = `${top}px`;
}

function getPointerAngleFromCardCenter(cardElement, event) {
    const center = getCardViewportCenter(cardElement);

    return Math.atan2(event.clientY - center.y, event.clientX - center.x) * (180 / Math.PI);
}

function getNormalizedAngleDifference(startAngle, currentAngle) {
    let angleDifference = currentAngle - startAngle;

    if (angleDifference > 180) {
        angleDifference -= 360;
    }

    if (angleDifference < -180) {
        angleDifference += 360;
    }

    return angleDifference;
}

function startCardRotation(event) {
    if (!rotationTarget) {
        return;
    }

    const cardElement = rotationTarget.cardElement;

    activeInteraction = {
        type: 'rotate',
        cardElement,
        captureElement: rotateButton,
        lastAngle: getPointerAngleFromCardCenter(cardElement, event),
        currentRotation: getCardRotation(cardElement),
    };

    bringCardToFront(cardElement);
    rotateButton.setPointerCapture(event.pointerId);
    event.preventDefault();
}

function rotateCard(event) {
    if (activeInteraction?.type !== 'rotate') {
        return;
    }

    const currentAngle = getPointerAngleFromCardCenter(activeInteraction.cardElement, event);
    const rotationDifference = getNormalizedAngleDifference(activeInteraction.lastAngle, currentAngle);
    const rotation = Math.round(activeInteraction.currentRotation + rotationDifference);

    activeInteraction.lastAngle = currentAngle;
    activeInteraction.currentRotation = rotation;
    setCardRotation(activeInteraction.cardElement, rotation);
    updateRotateButtonPosition(activeInteraction.cardElement, rotationTarget.handleName);
}

function updateRotateButtonPosition(cardElement, handleName) {
    const handle = getHandleGeometry(cardElement).find((candidate) => candidate.name === handleName);

    if (handle) {
        showRotateButton(cardElement, handle);
    }
}

function endActiveInteraction(event) {
    if (!activeInteraction) {
        return;
    }

    const captureElement = activeInteraction.captureElement;
    activeInteraction = null;

    if (event) {
        updateRotateButtonFromPointer(event);
    } else {
        hideRotateButton();
    }

    if (captureElement?.hasPointerCapture?.(event?.pointerId)) {
        captureElement.releasePointerCapture(event.pointerId);
    }
}

function startCanvasPan(event) {
    activeInteraction = {
        type: 'pan',
        startPointer: { x: event.clientX, y: event.clientY },
        startScroll: { x: viewport.scrollLeft, y: viewport.scrollTop },
    };

    viewport.style.cursor = 'grabbing';
    hideRotateButton();
}

function panCanvas(event) {
    if (activeInteraction?.type !== 'pan') {
        return;
    }

    viewport.scrollLeft = activeInteraction.startScroll.x - (event.clientX - activeInteraction.startPointer.x);
    viewport.scrollTop = activeInteraction.startScroll.y - (event.clientY - activeInteraction.startPointer.y);
}

function handleViewportPointerDown(event) {
    if (event.button !== 0 || event.target.closest('.btns_container, article')) {
        return;
    }

    const handleElement = event.target.closest('.handle');

    if (handleElement) {
        startCardResize(handleElement, event);
        return;
    }

    const cardElement = event.target.closest('.note_wrapper');

    if (cardElement) {
        if (event.target.closest('.note_content, button')) {
            return;
        }

        startCardDrag(cardElement, event);
        return;
    }

    document.querySelectorAll('.note_wrapper.selected').forEach((selectedCard) => {
        selectedCard.classList.remove('selected');
    });
    startCanvasPan(event);
}

function handleViewportClick(event) {
    const deleteButton = event.target.closest('.delete_btn');

    if (deleteButton) {
        deleteButton.closest('.note_wrapper').remove();
        hideRotateButton();
        return;
    }

    const indexButton = event.target.closest('.index_btn');

    if (indexButton) {
        const cardElement = indexButton.closest('.note_wrapper');
        selectCard(cardElement);
        bringCardToFront(cardElement);
    }
}

function handleKeyboardDelete(event) {
    if (event.key !== 'Delete' || event.target.closest('.note_content')) {
        return;
    }

    document.querySelector('.note_wrapper.selected')?.remove();
    hideRotateButton();
}

function createCard() {
    const cardElement = document.createElement('div');

    cardElement.className = 'note_wrapper';
    cardElement.dataset.rotation = '0';
    cardElement.innerHTML = `
        <div class="note_card">
            <span class="handle top_left"></span>
            <span class="handle top_right"></span>
            <span class="handle bottom_left"></span>
            <span class="handle bottom_right"></span>
            <div class="note_header">
                <button class="index_btn" type="button"><img src="./images/arrow-up-double.svg" alt="Bring to front"></button>
                <button class="delete_btn" type="button"><img src="./images/delete-02 (1).svg" alt="Delete note"></button>
            </div>
            <div class="note_content" contenteditable="true"></div>
        </div>
    `;

    cardElement.style.left = `${viewport.scrollLeft + (window.innerWidth / 2) - 100}px`;
    cardElement.style.top = `${viewport.scrollTop + (window.innerHeight / 2) - 100}px`;
    canvas.append(cardElement);
    selectCard(cardElement);
}

function darkenColour(hex) {
    const red = Math.floor(parseInt(hex.slice(1, 3), 16) * 0.75);
    const green = Math.floor(parseInt(hex.slice(3, 5), 16) * 0.75);
    const blue = Math.floor(parseInt(hex.slice(5, 7), 16) * 0.75);

    return `rgb(${red}, ${green}, ${blue})`;
}

function changeSelectedCardColour(button) {
    const selectedCard = document.querySelector('.note_wrapper.selected');

    if (!selectedCard) {
        return;
    }

    const colour = button.dataset.color;
    selectedCard.querySelector('.note_content').style.backgroundColor = colour;
    selectedCard.querySelector('.note_header').style.backgroundColor = darkenColour(colour);
}

function initializeNoteCanvas() {
    initializeViewportPosition();
    addCardButton.addEventListener('click', createCard);
    viewport.addEventListener('pointerdown', handleViewportPointerDown);
    document.addEventListener('pointermove', (event) => {
        moveCard(event);
        resizeCard(event);
        rotateCard(event);
        panCanvas(event);
        updateRotateButtonFromPointer(event);
    });
    document.addEventListener('pointerup', endActiveInteraction);
    document.addEventListener('pointercancel', endActiveInteraction);
    viewport.addEventListener('click', handleViewportClick);
    document.addEventListener('keydown', handleKeyboardDelete);
    rotateButton.addEventListener('pointerdown', startCardRotation);
    colourButtons.forEach((button) => {
        button.style.backgroundColor = button.dataset.color;
        button.addEventListener('click', () => changeSelectedCardColour(button));
    });
}

initializeNoteCanvas();
