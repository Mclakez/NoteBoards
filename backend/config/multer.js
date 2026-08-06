import { cloudinary } from './cloudinary.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "NoteBoards/images",
        allowed_formats: ["jpg", "png", "jpeg", "svg", "webp"],
        transformation: [
            {width: 500, height: 500, crop: "limit"}
        ]
    },
})
export const upload = multer({ storage})