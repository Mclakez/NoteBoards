import { verifyWebToken } from "../config/jwt.js";

export async function checkJwt(req, res, next) {
  const token = req.cookies.token
  if(!token) {
      return res.status(401).json({ message: 'No token, access denied' })
  }
  
  try {
    const decoded = await verifyWebToken(token)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired' })
  }
}