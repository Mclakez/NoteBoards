import { NoteCanvas } from "../models/NoteCanvas.js";
import { User } from "../models/User.js";
import { Note } from "../models/NoteCard.js";


export async function getAllCanvas(req, res) {
  const userId = req.user.userId
  try {
    const userCanvas = await NoteCanvas.find({ userId })

    if (!userCanvas) {
      res.status(404).json({message: "No Canvas found"})
    }

    res.status(200).json(userCanvas)
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}

export async function getCanvas(req, res) {
  const { id } = req.params
  try {
    const canvas = await NoteCanvas.findById(id)
    const notes = await Notes.find({ canvasId: id })

    res.status(200).json({
      canvas,
      notes
    })
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}

export async function addCanvas(req, res) {
  const userId = req.user.userId
  const { title } = req.body

  try {
    const newCanvas = await NoteCanvas.create({
      userId,
      title,
      pinned: false
    })

    res.status(200).json({
      id: newCanvas._id,
      title: newCanvas.title
    })
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}

export async function updateCanvas(req, res) {
  const { id } = req.params

  try {
    const updatedCanvas = await NoteCanvas.findByIdAndUpdate(id,{
      $set: req.body
    }, {
      new: true,
    })

    if (!updatedCanvas) {
      res.status(500).json({message: "User not Found"})
    }

    res.status(200).json(updatedCanvas)
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}

export async function deleteCanvas() {
  const { id } = req.params

  try {
    const deletedCanvas = await NoteCanvas.findByIdAndDelete(id)

    if (!deletedCanvas) return res.status(401).json({ error: "Canvas not found" })
    res.status(200).json({
        message: "Canvas deleted successfully",
        deletedCanvas
    })
    
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}