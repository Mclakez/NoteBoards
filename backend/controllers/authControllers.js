import { generateWebToken } from '../config/jwt.js'
import {User} from '../models/User.js'
import bcrypt from 'bcryptjs'


export async function signup(req, res) {
  
  try {
    const { username, password, email } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400).json({ message: "Username is already taken" })
      return
    }
  
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
  
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    })
  
    res.status(200).json({
      message: "User succesfully created",
      userId: newUser._id
    })
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

export async function login(req, res) {
  
  try {
    const { username, password } = req.body
    const existingUser = await User.findOne({ username })
    
    if (!existingUser) {
      res.status(400).json({ message: "Not an existing user" })
      return
    }

    const isPasswordMatch = await bcrypt.compare(password, existingUser.password)
    if (!isPasswordMatch) {
      res.status(400).json({ message: "Invalid Password" })
      return
    }

    const token = generateWebToken(existingUser)
    res.cookie('token', token,{
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7*24*60*60*1000
      
    })
    res.status(200).json({
      message: "Login successful",
      token,
      username
    })
    
    
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

export async function logout(req, res) {
  res.clearCookie('token')
  res.status(200).json({message: 'You were logged out succesfully'})
}