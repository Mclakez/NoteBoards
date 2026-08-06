import mongoose from 'mongoose'
import {User} from "../models/User.js"

export const initDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("DB connected")
    console.log(await User.collection.indexes());
  } catch (e) {
    console.log(e, "DB not connected")
  }
}