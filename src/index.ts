import express from 'express'
import { signup, login, isAuth } from './controllers'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors({
  origin: '*'
}))

app.post('/signup', signup)
app.post('/login', login)
app.post('/private', isAuth)

app.listen(process.env.PORT ?? 8000)
