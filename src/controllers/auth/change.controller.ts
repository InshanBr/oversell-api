import { Request, Response } from 'express'
import { prismaClient } from '../../database/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

interface DecodedToken {
  id: string
  iat: number
  exp: number
}

export const Change = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { email, username } = req.body
    const { authorization } = req.headers

    if (!authorization) return res.status(400).json({ error: 'Missing token' })

    const token = authorization.split(' ')[1]

    const decodedToken = jwt.verify(token, 'secret') as DecodedToken

    if (!decodedToken) { return res.status(400).json({ error: 'Failed to decode token' }) }

    const user = await prismaClient.user.findFirst({
      where: {
        id: decodedToken.id
      }
    })

    if (!user) return res.status(400).json({ error: 'User not found' })
    if (!username) return res.status(400).json({ error: 'Missing param: username' })
    if (!email) return res.status(400).json({ error: 'Missing param: email' })

    const update = await prismaClient.user.update({
      where: { id: decodedToken.id },
      data: {
        email: req.body.email,
        username: req.body.username
      },
      select: {
        email: true,
        username: true
      }
    })

    return res.status(200).json(
      update
    )
  } catch (err: any) {
    console.log(err)
    return res.status(400).json({ error: 'Failed to change info of the user' })
  }
}

export const Password = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
    const { password, newPassword } = req.body
    const { authorization } = req.headers

    if (!authorization) return res.status(400).json({ error: 'Missing token' })
    if (!password) return res.status(400).json({ error: 'Missing Password' })
    if (!newPassword) return res.status(400).json({ error: 'Missing New Password' })

    const token = authorization.split(' ')[1]

    const decodedToken = jwt.verify(token, 'secret') as DecodedToken

    if (!decodedToken) { return res.status(400).json({ error: 'Failed to decode token' }) }

    const user = await prismaClient.user.findFirst({
      where: {
        id: decodedToken.id
      }
    })

    if (!user) return res.status(400).json({ error: 'Email/Password is invalid' })

    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    if (!passwordIsCorrect) return res.status(400).json({ error: 'Password is invalid' })

    const passwordHash = await bcrypt.hash(newPassword, 12)

    const update = await prismaClient.user.update({
      where: { id: decodedToken.id },
      data: {
        password: passwordHash
      }
    })

    if (!update) return res.status(400).json({ error: 'Password change failed' })

    return res.status(200).json({ message: 'Password changed' })
  } catch (err: any) {
    console.log(err)
    return res.status(400).json({ error: 'Failed to change password' })
  }
}
