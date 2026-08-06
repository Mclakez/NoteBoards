import express from 'express'
import {signup, login, logout} from '../controllers/authControllers.js'

export const authRouter = express.Router()

authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.post('/logout', logout)