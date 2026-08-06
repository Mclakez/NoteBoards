import mongoose from 'mongoose'

const NoteCanvasSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    default: 'Untitled'
  },
  pinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

export const NoteCanvas = mongoose.model("NoteCanvas", NoteCanvasSchema)