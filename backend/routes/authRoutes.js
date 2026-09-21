import express from 'express'
import {signup, login, logout} from '../controllers/authControllers.js'
import passport from 'passport'
import { generateWebToken } from '../config/jwt.js'

export const authRouter = express.Router()

authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.get('/google', passport.authenticate('google', {scope: ['profile', 'email'], session: false}))
authRouter.get('/google/callback', passport.authenticate('google', {session: false, failureRedirect: '/'}),
async (req, res) => {
        try {
            const user = req.user
            const token = generateWebToken(user)
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 7*24*60*60*1000
            })
             res.redirect(`${process.env.CLIENT_URL}/auth-success.html`)
        } catch (error) {
            console.error('Google callback error:', error)
             res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`)
        }
    })