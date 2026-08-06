import { cloudinary } from '../config/cloudinary.js';
import { BoardCard } from '../models/BoardCard.js'
import { BoardCanvas } from '../models/BoardCanvas.js'

export async function addCard(req, res) {
  const { canvasId} = req.params
  const { title, description } = req.body
  try {

    if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
    }

    const cardImageUrl = req.file.path
    const cardImageId = cardImageUrl.split('/').slice(-2).join('/').split('.')[0]
    
    const newCard = await Note.create({
      canvasId,
      cardImageId,
      cardImageUrl,
      title,
      description
    })

    res.status(200).json({
      message: "Card sucessfully created",
      newCard
    })

    
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}

export async function updateCard(req, res) {
  const { cardId } = req.params
  const {title, description, x, y, rotation, z_index} = req.body
  try {
    const card = await BoardCard.findById(cardId)
    if (!card) return res.status(404).json({ error: "Card not found" })
    const updateData = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (x !== undefined) updateData.x = x
    if (y !== undefined) updateData.y = y
    if (rotation !== undefined) updateData.rotation = rotation
    if (z_index !== undefined) updateData.z_index = z_index

    if (req.file) {
          if (card.cardImageId) {
            await cloudinary.uploader.destroy(card.cardImageId)
          }
          updateData.cardImageUrl = req.file.path
          updateData.cardImageId = req.file.filename
        }
    
    const updatedCard = await Note.findByIdAndUpdate(cardId, {
      $set: updateData
    },
      {
      new: true
    })

    if (!updatedCard) return res.status(404).json({ error: "Card not found" })

    res.status(200).json({
      message: "Card sucessfully updated",
      updatedCard
    })

    
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}

export async function deleteCard(req, res) {
  const { cardId } = req.params
  
  try {
    const card = await Note.findById(cardId)
    if (!card) return res.status(404).json({ error: "Card not found" })

    await cloudinary.uploader.destroy(card.cloudinaryId)
    const deletedCard = await Note.findByIdAndDelete(cardId)
    
    res.status(200).json({
      message: "Card sucessfully deleted",
      deletedCard
    })

  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}