import express from 'express'
import { addCanvas, deleteCanvas, updateCanvas, getAllCanvas, getCanvas } from '../controllers/noteCanvasControllers.js'
import { checkJwt } from '../middlewares/auth.js'
import { upload } from '../config/multer.js'

export const noteCanvasRouter = express.Router()

noteCanvasRouter.get('/', checkJwt, getAllCanvas)
noteCanvasRouter.get('/:id', checkJwt, getCanvas)
noteCanvasRouter.post('/', checkJwt, addCanvas)
noteCanvasRouter.delete('/:id', checkJwt, deleteCanvas)
noteCanvasRouter.patch('/update/:id', checkJwt, updateCanvas)
// routes/noteCanvases.js
noteCanvasRouter.post('/:id/thumbnail', checkJwt, upload.single('thumbnail'), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'noteboards/thumbnails',
            public_id: `canvas_${req.params.id}`,
            overwrite: true
        })

        await NoteCanvas.findByIdAndUpdate(req.params.id, {
            thumbnail_url: result.secure_url
        })

        res.status(200).json({ thumbnail_url: result.secure_url })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
})
