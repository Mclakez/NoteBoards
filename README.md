# NoteBoards Change Log

This README captures the main changes made during this chat, with short code snippets and direct before/after comparisons.

Future changes should be added to this file so the project keeps a running record of what was changed, why, and how it was implemented.

---

## 1) Cloudinary image quality fix

### Problem
The uploaded board images were being aggressively resized before storage, which made them look blurry and low quality when displayed later.

### Before
```js
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "NoteBoards/images",
        allowed_formats: ["jpg", "png", "jpeg", "svg", "webp"],
        transformation: [
            {width: 500, height: 500, crop: "limit"}
        ]
    },
})
export const upload = multer({ storage})
```

### After
```js
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "NoteBoards/images",
        allowed_formats: ["jpg", "png", "jpeg", "svg", "webp"],
        transformation: [
            { width: 1800, height: 1800, crop: "limit", quality: "auto", fetch_format: "auto" }
        ]
    },
})
export const upload = multer({ storage })
```

### Why this was needed
The old settings forced a 500x500 crop/resize, which degraded the actual asset quality. The new settings preserve much more detail while still keeping the file manageable.

---

## 2) Modal overlay layering fix for board cards

### Problem
The board cards were appearing above the modal, meaning the modal looked broken or overlapped by the photo cards.

### Before
```css
.photo-board {
  position: relative;
  overflow: hidden;
  border-radius: 2.25rem;
  background-color: var(--board-orange);
}

.polaroid-card {
  position: absolute;
  z-index: 10;
}

.modal-backdrop {
  position: fixed;
  z-index: 20;
}
```

### After
```css
.photo-board {
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 2.25rem;
  background-color: var(--board-orange);
}

.polaroid-card {
  position: absolute;
  z-index: 1;
}

.polaroid-card.dragging {
  z-index: 12;
}

.modal-backdrop {
  position: fixed;
  z-index: 1000;
}

.photo-modal {
  position: relative;
  z-index: 1001;
}
```

### Why this was needed
The modal needed a higher stacking order than the board layer, while still allowing active drag states to appear on top of the board but below the modal.

---

## 3) Editable board name with backend sync

### Problem
The title on the right side of the board was static, not editable, and not persisted to the backend.

### Before
```html
<p class="board-name" id="board-name">My handsome face</p>
```

### After
```html
<p class="board-name" id="board-name" contenteditable="true" spellcheck="false" role="textbox" aria-label="Board name" aria-multiline="false">My handsome face</p>
```

### Frontend save logic
```js
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
```

### Event handling
```js
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
```

### Why this was needed
The board title needed to behave like a real editable field and persist to the same canvas update API already used elsewhere in the app.

---

## 4) Dashboard ordering by recent edits

### Problem
The dashboard had a fixed time string and did not actually sort cards by the most recently edited item.

### Before
```js
<div class="card-time">Edited 10 minutes ago</div>
```

```js
const pinnedItems = items.filter((item) => item.pinned);
const otherItems = items.filter((item) => !item.pinned);
```

### After
```js
function formatEditedTime(value) {
  const timestamp = new Date(value || Date.now()).getTime();
  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 1) {
    return 'Edited just now';
  }

  if (diffMinutes < 60) {
    return `Edited ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  return `Edited ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
}
```

```js
items = [...items].sort((a, b) => {
  const aTime = new Date(a.updatedAt || a.updated_at || 0).getTime();
  const bTime = new Date(b.updatedAt || b.updated_at || 0).getTime();
  return bTime - aTime;
});
```

### Why this was needed
The layout should reflect real recent activity, and the timestamp should be based on the actual MongoDB `updatedAt` fields instead of a placeholder.

---

## 5) Board canvas backend integration and save behavior

### Problem
The board actions were not fully aligned with the backend routes and needed consistent API behavior for create, edit, and delete operations.

### Example fix pattern
```js
if (activeCardId) {
  await api.patch(`/boardCard/${canvasId}/${activeCardId}`, formData);
} else {
  await api.post(`/boardCard/${canvasId}`, formData);
}
```

### Why this was needed
For uploads and updates, the frontend needed to send multipart `FormData` correctly for image changes and use the right backend routes without breaking the board flow.

---

## 6) Board screenshot thumbnail generation

### Problem
The board needed the same thumbnail/preview behavior the note canvas already had so the dashboard could show a live board preview image.

### Before
The board did not have a generated thumbnail path or a screenshot route.

### After
```html
<script src="./js/vendor/html2canvas.min.js"></script>
```

```js
async function saveScreenshot() {
  const cards = photoBoard.querySelectorAll('.polaroid-card');

  if (!photoBoard || !canvasId || cards.length === 0) {
    return;
  }

  const screenshotCanvas = await html2canvas(photoBoard, {
    x: minX - padding,
    y: minY - padding,
    width: Math.max(1, maxX - minX + (padding * 2)),
    height: Math.max(1, maxY - minY + (padding * 2)),
    scale: 0.3,
    useCORS: true,
    logging: false,
  });

  screenshotCanvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('thumbnail', blob, 'board-thumbnail.png');
    await api.post(`/boardCanvas/${canvasId}/thumbnail`, formData);
  }, 'image/png');
}
```

```js
boardCanvasRouter.post('/:id/thumbnail', checkJwt, upload.single('thumbnail'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'noteboards/thumbnails',
      public_id: `board_${req.params.id}`,
      overwrite: true
    })

    await BoardCanvas.findByIdAndUpdate(req.params.id, {
      thumbnail_url: result.secure_url
    })

    res.status(200).json({ thumbnail_url: result.secure_url })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})
```

```js
thumbnail_url: {
  type: String,
  default: ''
}
```

### Why this was needed
This keeps the board preview consistent with the note canvas and makes the board cards on the dashboard show a real visual summary instead of a generic placeholder.

---

## 7) JWT expiry redirect to login

### Problem
When the server rejected an expired or invalid JWT, the frontend stayed on the protected dashboard instead of sending the user back to the login screen.

### Before
```js
if (!res.ok) {
  const message = data.message || ''

  if (res.status === 401 || res.status === 403 || /jwt|token/i.test(message)) {
    redirectToLoginPage()
  }

  throw new Error(message || 'Something went wrong')
}
```

### After
```js
function clearAuthSession() {
  localStorage.removeItem('noteboards-user')
  document.cookie = 'token=; Max-Age=0; path=/; SameSite=Lax'
}

function redirectToLoginPage() {
  const isLoginPage = window.location.pathname.endsWith('/login.html')

  if (isLoginPage) {
    return
  }

  clearAuthSession()
  window.location.replace('./login.html')
}
```

### Why this was needed
Protected pages should never remain accessible after a session expires. Clearing stale auth state and redirecting to login keeps the user flow secure and predictable.

---

## 8) Google OAuth callback repair and success redirect

### Problem
The Google authentication flow was failing because the backend was importing the wrong model file and calling the wrong JWT helper name.

### Before
```js
import { User } from '../models/Users.js'
```

```js
const token = await generateToken(user)
```

### After
```js
import { User } from '../models/User.js'
import { generateWebToken } from '../config/jwt.js'
```

```js
const token = generateWebToken(user)
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000
})
res.redirect(`${process.env.CLIENT_URL}/auth-success.html`)
```

### Why this was needed
The OAuth callback must generate a valid cookie-backed JWT and then redirect the user into the app. Without this, Google sign-in cannot complete successfully.

---

## 9) Avatar initials from the signed-in username

### Problem
The user avatar on the dashboard was hardcoded to `AF`, so it did not reflect the actual signed-in account.

### Before
```html
<button class="avatar" aria-label="User profile">AF</button>
```

### After
```js
function getInitialsFromName(name = '') {
  const cleanName = name.trim();

  if (!cleanName) {
    return 'NB';
  }

  const nameParts = cleanName.split(/\s+/).filter(Boolean);

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
}
```

```js
const savedUserName = localStorage.getItem('noteboards-user') || 'NoteBoards';
avatarButton.textContent = getInitialsFromName(savedUserName);
```

### Why this was needed
The profile circle should reflect the user identity in a lightweight, reusable way without needing a profile image upload for every account.

---

## Summary

Across this chat, the key improvements were:

- improved uploaded image quality from Cloudinary
- fixed modal stacking so it sits on top of the board cards
- made the board title editable and saved to the backend
- sorted dashboard cards by the actual last-edited timestamp
- replaced static “Edited 10 minutes ago” text with real relative times
- added board screenshot thumbnail generation, consistent with the note canvas workflow
- redirected expired or invalid JWT sessions back to login automatically
- repaired the Google OAuth callback flow and added a successful redirect page
- replaced the hardcoded avatar initials with the signed-in user’s initials

These changes together make the board experience much more consistent and production-ready.

---

## Follow-up rule

Any future change, fix, or enhancement should be documented here in the same format: problem, before, after, and reason. This keeps the project history readable and easy to review.
