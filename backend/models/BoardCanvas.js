import mongoose from 'mongoose'

const BoardCanvasSchema = new mongoose.Schema({
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
  },
  background: {
    type: Number,
    default: 0
  },
  thumbnail_url: {
    type: String,
    default: ''
  }
}, { timestamps: true })

export const BoardCanvas = mongoose.model("BoardCanvas", BoardCanvasSchema)