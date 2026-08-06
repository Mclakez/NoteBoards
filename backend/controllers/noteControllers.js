import { Note } from '../models/NoteCard.js'
import { NoteCanvas } from '../models/NoteCanvas.js'

export async function addNote(req, res) {
  const { canvasId} = req.params
  const { color } = req.body
  try {
    const newCard = await Note.create({
      canvasId,
      color
    })

    res.status(200).json({
      message: "Note sucessfully created",
      newCard
    })

    
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}

export async function updateNote(req, res) {
  const { noteId } = req.params
  
  try {
    const updatedCard = await Note.findByIdAndDelete(noteId, {
      $set: req.body
    },
      {
      new: true
    })

    if (!updatedCard) return res.status(401).json({ error: "Card not found" })

    res.status(200).json({
      message: "Note sucessfully updated",
      updatedCard
    })

    
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}

export async function deleteNote(req, res) {
  const { noteId } = req.params
  
  try {
    const deletedCard = await Note.findByIdAndDelete(noteId)
    // if (!deletedCard) return res.status(401).json({ error: "Card not found" })

    res.status(200).json({
      message: "Note sucessfully deleted",
      deletedCard
    })

  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}