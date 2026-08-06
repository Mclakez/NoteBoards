import jwt from 'jsonwebtoken'


export function generateWebToken(user) {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    {expiresIn: '7d'}
  )
}

export function verifyWebToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  return decoded
}