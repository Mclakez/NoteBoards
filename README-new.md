# NoteBoards

This is a simple app for writing notes, creating boards, saving ideas, and organizing your work visually.

You can sign up, sign in, create boards, add notes, upload images, and keep everything in one place.

---

## What the app does

- Create an account
- Log in securely
- Make note canvases and board canvases
- Add text, images, and cards
- Save and update your work
- View a dashboard of recent items
- Upload image previews to Cloudinary
- Sign in with Google

---

## The project is made of 3 main parts

### 1. Frontend
This is the part users see in the browser.

It includes:
- login page
- register page
- dashboard
- notes page
- boards page
- canvas editors

Files live in the frontend folder.

### 2. Backend
This is the server that handles requests.

It handles:
- user signup/login
- JWT auth
- board and note routes
- image upload routes
- Google auth
- database access

Files live in the backend folder.

### 3. Database
This app uses MongoDB to store:
- user accounts
- notes
- boards
- canvas data
- thumbnails

---

## Tech used

- HTML
- CSS
- JavaScript
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Cloudinary
- Google OAuth

---

## Setup

### Install the backend dependencies

```bash
cd backend
npm install
```

### Create a `.env` file in backend

Example:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/noteboards?retryWrites=true&w=majority
JWT_SECRET=your_secret_here
CLIENT_URL=http://127.0.0.1:5500
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Start the backend

```bash
npm run dev
```

### Run the frontend
You can open the HTML files directly, or serve the folder locally.

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

## Deployment

### Backend
Deploy the backend to Render.

Set the environment variables in Render.

### Frontend
Deploy the frontend to Vercel.

The backend CORS settings must allow the Vercel domain.

---

## Why the project matters

This app helps you organize your thoughts, ideas, and projects in a relaxed visual way.

It is useful for:
- brainstorming
- writing down ideas
- saving references
- planning projects
- keeping visual collections

---

## Notes for future editing

If you want to make changes later:

- update the frontend HTML/CSS/JS for design and behavior
- update backend routes/controllers for logic
- update Mongo models if your data structure changes
- update environment variables for production hosting

---

## Simple summary

NoteBoards is a personal idea and note board app with a browser frontend, a Node backend, and MongoDB storage.

It is designed to feel simple, visual, and easy to use.
