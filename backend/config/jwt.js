import jwt from 'jsonwebtoken'


export async function generateWebToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    {expiresIn: '7d'}
  )
}

export async function verifyWebToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  return decoded
}