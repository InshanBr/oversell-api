import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { prismaClient } from '../../database/client'

interface DecodedToken {
  id: string
  iat: number
  exp: number
}

function exclude<User, Key extends keyof User> (
  user: User,
  keys: Key[]
): Omit<User, Key> {
  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete user[key]
  }
  return user
}

export const isAuth = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | undefined> => {
  try {
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

    const info = exclude(user, ['password'])

    return res.status(200).json(
      info
    )
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || 'could not decode the token' })
  }
}
