import express from 'express'
import { addCanvas, deleteCanvas, updateCanvas, getAllCanvas, getCanvas } from '../controllers/noteCanvasControllers.js'
import { checkJwt } from '../middlewares/auth.js'

export const noteCanvasRouter = express.Router()

noteCanvasRouter.get('/', checkJwt, getAllCanvas)
noteCanvasRouter.get('/:id', checkJwt, getCanvas)
noteCanvasRouter.post('/', checkJwt, addCanvas)
noteCanvasRouter.delete('/:id', checkJwt, deleteCanvas)
noteCanvasRouter.patch('/update/:id', checkJwt, updateCanvas)
