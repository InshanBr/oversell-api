import { Request, Response } from 'express'
import { prismaClient } from '../../database/client'
import jwt from 'jsonwebtoken'

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
