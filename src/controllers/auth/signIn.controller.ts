import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prismaClient } from '../../database/client'

export const SignIn = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { email, password } = req.body

    if (!email) return res.status(400).json({ error: 'Missing param: email' })
    if (!password) return res.status(400).json({ error: 'Missing param: password' })

    const user = await prismaClient.user.findFirst({
      where: {
        email
      }
    })

    if (!user) return res.status(400).json({ error: 'Email/Password is invalid' })

    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    if (!passwordIsCorrect) return res.status(400).json({ error: 'Email/Password is invalid' })

    const token = jwt.sign({ id: user.id }, 'secret', {
      expiresIn: '24h'
    })

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      username: user.username
    }

    return res.json({
      user: userWithoutPassword,
      token
    })
  } catch (err) {
    return res.status(400).json({ error: 'Failed to login' })
  }
}
