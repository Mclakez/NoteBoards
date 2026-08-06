import express from 'express'
import 'dotenv/config'
import { initDB } from './config/db.js'
import { noteRouter } from './routes/noteRoutes.js'
import { noteCanvasRouter } from './routes/noteCanvasRoutes.js'
import { authRouter } from './routes/authRoutes.js'
import cookieParser from 'cookie-parser'


initDB()

const app = express()
const PORT = 5000

app.use(express.json())
app.use(cookieParser())

app.use('/api/noteCard', noteRouter)
app.use('/api/auth', authRouter)
app.use('/api/noteCanvas', noteCanvasRouter)

app.get('/', (req, res) => {
  res.json({ message: 'NoteBoards API running' })
})

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`)
})



