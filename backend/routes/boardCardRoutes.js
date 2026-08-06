import express from 'express'
import { checkJwt } from '../middlewares/auth.js'
import { addCard, updateCard, deleteCard } from '../controllers/boardCardControllers.js'
import { upload } from "../config/multer.js";

export const boardCardRouter = express.Router()


boardCardRouter.post('/:canvasId', checkJwt, upload.single('image'), addCard)
boardCardRouter.patch('/:canvasId/:noteId', checkJwt, updateCard)
boardCardRouter.delete('/:canvasId/:noteId', checkJwt, deleteCard)