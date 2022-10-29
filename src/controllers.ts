import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const checkemail = await prisma.user.findFirst({
      where: {
        email: req.body.email
      }
    })
    if (checkemail === null) {
      const passwordHash = await bcrypt.hash(req.body.password, 12)
      const user = await prisma.user.create({
        data: {
          email: req.body.email,
          password: passwordHash,
          username: req.body.username
        }
      })
      res.json(user)
    } else {
      res.json({ err: 'user already exists!' })
    }
  } catch (err) {
    res.json({ err: 'error at create user!' })
  }
}

const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const checkemail = await prisma.user.findFirst({
      where: {
        email: req.body.email
      }
    })
    if (checkemail === null) {
      res.json({ err: 'user not found!' })
    } else {
      bcrypt.compare(req.body.password, checkemail.password, (err, compareRes) => {
        if (err) { // error while comparing
          res.status(502).json({ message: 'error while checking user password' })
        } else if (compareRes) { // password match
          const token = jwt.sign({ email: req.body.email }, 'secret', { expiresIn: '1h' })
          res.status(200).json({ message: 'user logged in', token })
        } else { // password doesnt match
          res.status(401).json({ message: 'invalid credentials' })
        };
      })
    }
  } catch (err) {
    res.json({ err: 'error at login!' })
  }
}

const isAuth = async (req: Request, res: Response): Promise<any> => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    return res.status(401).json({ message: 'not authenticated' })
  };
  const token = authHeader.split(' ')[1]
  let decodedToken
  try {
    decodedToken = jwt.verify(token, 'secret')
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'could not decode the token' })
  };
  if (!decodedToken) {
    res.status(401).json({ message: 'unauthorized' })
  } else {
    res.status(200).json({ message: 'here is your resource' })
  }
}

export { signup, login, isAuth }
