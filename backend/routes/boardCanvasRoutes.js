import express from 'express'
import { addCanvas, deleteCanvas, updateCanvas, getAllCanvas, getCanvas } from '../controllers/boardCanvasControllers.js'
import { checkJwt } from '../middlewares/auth.js'
import { upload } from '../config/multer.js'
import { cloudinary } from '../config/cloudinary.js'
import { BoardCanvas } from '../models/BoardCanvas.js'

export const boardCanvasRouter = express.Router()

boardCanvasRouter.get('/', checkJwt, getAllCanvas)
boardCanvasRouter.get('/:id', checkJwt, getCanvas)
boardCanvasRouter.post('/', checkJwt, addCanvas)
boardCanvasRouter.delete('/:id', checkJwt, deleteCanvas)
boardCanvasRouter.patch('/update/:id', checkJwt, updateCanvas)
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
