# NoteBoards

NoteBoards is a web app for creating notes and boards, saving content, uploading images, and organizing ideas in a visually simple workspace.

It has a Node.js/Express backend, a MongoDB database, and a static frontend that runs in the browser.

---

## What this project does

This app lets users:

- create an account and sign in
- make notes and boards
- add text and images
- save and update boards
- view recent items on a dashboard
- upload images to Cloudinary
- use Google sign-in
- keep their session secure with JWT cookies

---

## Project structure

```text
NoteBoards/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/
│   ├── images/
│   ├── js/
│   ├── *.html
│   └── fonts/
├── README.md
├── README-2.md
└── .gitignore
```

---

## Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT + cookies, plus Google OAuth
- File uploads: Cloudinary + Multer
- Hosting: Render for backend, Vercel for frontend

---

## How it works

### Frontend
The frontend is a simple static app. It loads pages like:

- login.html
- register.html
- notes.html
- boards.html
- note-canvas.html
- board-canvas.html

It talks to the backend through API calls in the JavaScript files inside the frontend/js folder.

### Backend
The backend exposes routes for:

- auth
- notes
- boards
- canvases
- image uploads

The server handles requests, validates JWT tokens, and saves data to MongoDB.

### Database
MongoDB stores:

- users
- notes
- boards
- canvas data
- thumbnails

---

## Local setup

### 1. Install backend dependencies

Open the backend folder:

```bash
cd backend
npm install
```

### 2. Create environment variables
Create a `.env` file in the backend folder with values like:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/noteboards?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://127.0.0.1:5500
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start the backend

```bash
npm run dev
```

Or if the script is set to `node server.js`:

```bash
node server.js
```

### 4. Run the frontend
Since this is mostly static HTML/JS, you can open the HTML files directly in a browser, or serve the frontend folder with a local static server.

Example:

```bash
cd frontend
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/login.html
```

---

## Production deployment

### Backend
Deploy the backend to Render.

Set these environment variables in Render:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Frontend
Deploy the frontend to Vercel.

Set the frontend origin to allow requests from the Vercel domain in the backend CORS config.

---

## Authentication flow

Users can sign up with email and password or sign in with Google.

The backend:

- creates users
- hashes passwords with bcrypt
- creates JWT tokens
- stores the token in an HTTP-only cookie
- protects routes with middleware

---

## Important notes

- The frontend should not hardcode localhost URLs in production.
- The backend must allow the Vercel frontend origin in CORS.
- Cookies need `secure: true` and `sameSite: 'none'` when using cross-site deployment.
- Fonts and static files are sensitive to file name casing on Linux hosting. Make sure file paths match exactly.

---

## Common commands

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
python -m http.server 8000
```

---

## Future improvements

This project could be upgraded with:

- Drag-and-drop note improvements
- Better board editing experience
- Shareable boards
- Real-time collaboration
- Better mobile UX
- Better test coverage

---

## Summary

NoteBoards is a personal idea board and note-taking app. It combines a browser-based frontend with a secure backend and cloud media storage, making it easy to capture and organize visual ideas.

If you want to keep developing it, this project is structured in a simple enough way that you can keep adding features without major rewrites.
