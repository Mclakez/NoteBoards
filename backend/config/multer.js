import { cloudinary } from './cloudinary.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "NoteBoards/images",
        allowed_formats: ["jpg", "png", "jpeg", "svg", "webp"],
        transformation: [
            { width: 1800, height: 1800, crop: "limit", quality: "auto", fetch_format: "auto" }
        ]
    },
})
export const upload = multer({ storage })