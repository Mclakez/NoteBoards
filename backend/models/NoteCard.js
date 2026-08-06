import mongoose from 'mongoose'

const NoteCardSchema = new mongoose.Schema({
  canvasId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NoteCanvas",
    required: true
  },
  content: {
    type: String,
    default: ""
  },
  z_index: {
    type: Number,
    default: 1
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  rotation: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: "#FF6B6B"
  }
}, { timestamps: true })

export const Note = mongoose.model("NoteCard", NoteCardSchema)