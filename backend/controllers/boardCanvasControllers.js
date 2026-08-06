import { BoardCanvas } from "../models/BoardCanvas.js";
import { BoardCard } from "../models/BoardCard.js";


export async function getAllCanvas(req, res) {
  const userId = req.user.userId
  try {
    const userCanvas = await BoardCanvas.find({ userId })

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
    const canvas = await BoardCanvas.findById(id)
    const notes = await BoardCard.find({ canvasId: id })

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
    const newCanvas = await BoardCanvas.create({
      userId,
      title,
      pinned: false
    })

    res.status(200).json({
      id: newCanvas._id,
      newCanvas
    })
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}

export async function updateCanvas(req, res) {
  const { id } = req.params

  try {
    const updatedCanvas = await BoardCanvas.findByIdAndUpdate(id,{
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

export async function deleteCanvas(req, res) {
  const { id } = req.params

  try {
    const deletedCanvas = await BoardCanvas.findByIdAndDelete(id)

    if (!deletedCanvas) return res.status(401).json({ error: "Canvas not found" })
    res.status(200).json({
        message: "Canvas deleted successfully",
        deletedCanvas
    })
    
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message})
  }
}