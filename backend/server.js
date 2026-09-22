import express from 'express'
import 'dotenv/config'
import { initDB } from './config/db.js'
import { noteRouter } from './routes/noteRoutes.js'
import { noteCanvasRouter } from './routes/noteCanvasRoutes.js'
import { authRouter } from './routes/authRoutes.js'
import { boardCardRouter } from './routes/boardCardRoutes.js'
import { boardCanvasRouter } from './routes/boardCanvasRoutes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { configurePassport } from './config/passport.js';
import passport from 'passport'


initDB()

const app = express()
const PORT = process.env.PORT || 5000

app.use(passport.initialize())
configurePassport()

const allowedOrigins = [
  'https://note-boards.vercel.app',
  'http://127.0.0.1:5500'
]

app.use(cors({
    origin: function(origin, callback) {
      if(!origin || allowedOrigins.includes(origin)) {
       callback(null, true) 
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
}))


app.use(express.json())
app.use(cookieParser())

app.use('/api/noteCard', noteRouter)
app.use('/api/boardCard', boardCardRouter)
app.use('/api/auth', authRouter)
app.use('/api/noteCanvas', noteCanvasRouter)
app.use('/api/boardCanvas', boardCanvasRouter)

app.get('/', (req, res) => {
  res.json({ message: 'NoteBoards API running' })
})

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`)
})



