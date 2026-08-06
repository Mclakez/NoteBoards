import express from 'express'
import { addCanvas, deleteCanvas, updateCanvas, getAllCanvas, getCanvas } from '../controllers/boardCanvasControllers.js'
import { checkJwt } from '../middlewares/auth.js'

export const boardCanvasRouter = express.Router()

boardCanvasRouter.get('/', checkJwt, getAllCanvas)
boardCanvasRouter.get('/:id', checkJwt, getCanvas)
boardCanvasRouter.post('/', checkJwt, addCanvas)
boardCanvasRouter.delete('/:id', checkJwt, deleteCanvas)
boardCanvasRouter.patch('/update/:id', checkJwt, updateCanvas)
