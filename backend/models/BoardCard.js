import mongoose from 'mongoose'

const BoardCardSchema = new mongoose.Schema({
  canvasId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BoardCanvas",
    required: true
  },
  title: {
    type: String,
    default: ""
  },
  description: {
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
  cardImageUrl: {
      type: String,
      default: null
  },
  cardImageId: {
      type: String,
      default: null
  },
  
}, { timestamps: true })

export const BoardCard = mongoose.model("BoardCard", BoardCardSchema)