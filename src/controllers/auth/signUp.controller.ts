import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prismaClient } from '../../database/client'
import jwt from 'jsonwebtoken'

export const SignUp = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { email, password, username } = req.body

    if (!username) return res.status(400).json({ error: 'Missing param: username' })
    if (!email) return res.status(400).json({ error: 'Missing param: email' })
    if (!password) return res.status(400).json({ error: 'Missing param: password' })

    const emailAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email
      }
    })

    if (emailAlreadyExists) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prismaClient.user.create({
      data: {
        email: req.body.email,
        password: passwordHash,
        username: req.body.username
      }
    })

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
    console.log(err)
    return res.status(400).json({ error: 'Failed to create a new user' })
  }
}
