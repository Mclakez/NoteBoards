# NoteBoards

NoteBoards is a simple app for creating notes, organizing ideas, and building visual boards for personal projects, planning, and inspiration.

It combines a browser-based frontend, a Node.js backend, and a MongoDB database to help users save notes, upload images, and manage their work in one place.

---

## What this app does

- Create an account and sign in
- Create note boards and board canvases
- Add text and images to cards
- Save and update work automatically
- View recent items on a dashboard
- Upload images to Cloudinary
- Sign in with Google
- Keep sessions secure with JWT cookies

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
│   ├── fonts/
│   ├── images/
│   ├── js/
│   ├── *.html
│   └── vendor/
├── README.md
├── README-2.md
├── README-new.md
├── .gitignore
└── package.json (if present at the root)
```

---

## Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT + cookies, Google OAuth
- Media storage: Cloudinary
- Hosting: Render for backend, Vercel for frontend

---

## How it works

### Frontend
The frontend is a static app built with HTML, CSS, and JavaScript. It loads pages such as:

- login
- register
- dashboard
- notes
- boards
- note canvas
- board canvas

The browser sends requests to the backend through API calls defined in the frontend JavaScript files.

### Backend
The backend handles:

- user signup and login
- JWT verification
- protected routes
- board and note operations
- photo uploads
- Google authentication
- database access

### Database
MongoDB stores data such as:

- users
- notes
- boards
- canvas content
- thumbnails and uploaded media metadata

---

## Local setup

### 1. Install dependencies

Open the backend folder and install the packages:

```bash
cd backend
npm install
```

### 2. Create a `.env` file
Create a file named `.env` inside the backend folder.

Example:

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

If that script is not present, run:

```bash
node server.js
```

### 4. Run the frontend
You can serve the frontend locally with a simple static server:

```bash
cd frontend
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/login.html
```

---

## Deployment

### Backend on Render
Deploy the backend to Render and add the same environment variables there.

Common variables to set:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Frontend on Vercel
Deploy the frontend to Vercel.

Make sure the backend CORS config allows the Vercel domain and that cookies are allowed for cross-site requests.

---

## Authentication

Users can sign up in two ways:

- traditional email/password signup
- Google sign-in

The backend hashes passwords with bcrypt, creates JWT tokens, and stores auth tokens in secure cookies.

---

## Notes for development

A few important things to keep in mind while working on this project:

- do not hardcode localhost URLs in production
- make sure the backend allows your Vercel frontend origin in CORS
- use `secure: true` and `sameSite: 'none'` for cookies in production deployments
- check font file casing carefully when deploying to Linux-based hosting like Vercel and Render

---

## Typical workflow

1. Start the backend
2. Start a local static frontend server
3. Sign up or log in
4. Create or open a board
5. Add notes or images
6. Save your changes
7. Check the dashboard for recent activity

---

## Why this project exists

NoteBoards was built to feel simple and visual. It helps users:

- capture ideas quickly
- organize thoughts in a clean layout
- store content in one place
- turn ideas into boards and notes

It is especially useful for brainstorming, planning, and personal organization.

---

## Future improvements

Some ideas for future upgrades include:

- drag-and-drop improvements
- better mobile responsiveness
- board sharing
- real-time multiplayer collaboration
- richer note editing
- stronger test coverage

---

## Summary

NoteBoards is a lightweight personal productivity app for notes and visual boards. It uses a static frontend, a Node.js backend, and MongoDB for persistence, making it easy to extend and deploy.

This project is simple enough to understand and flexible enough to keep growing.

---

## Quick start

```bash
cd backend
npm install
npm run dev
```

Then in another terminal:

```bash
cd frontend
python -m http.server 8000
```

Open:

```text
http://localhost:8000/login.html
```
