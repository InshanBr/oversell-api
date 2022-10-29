import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const app = express()
const prisma = new PrismaClient()
app.use(express.json())

app.post('/login', async (req, res) => {
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
      res.json({ err: 'User already exists!' })
    }
  } catch (err) {
    res.json({ err: 'Error at create user!' })
  }
})

app.listen(8000)
