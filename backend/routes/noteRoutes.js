import express from 'express'
import { checkJwt } from '../middlewares/auth.js'
import { addNote, updateNote, deleteNote} from '../controllers/noteControllers.js'

export const noteRouter = express.Router()

// noteRouter.get('/notes', checkJwt, getNotes)
noteRouter.post('/:canvasId', checkJwt, addNote)
noteRouter.patch('/:canvasId/:noteId', checkJwt, updateNote)
noteRouter.delete('/:canvasId/:noteId', checkJwt, deleteNote)