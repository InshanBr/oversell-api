import express from 'express'
import { signup, login, isAuth } from './controllers'

const app = express()
app.use(express.json())

app.post('/signup', signup)
app.post('/login', login)
app.post('/private', isAuth)

app.listen(8000)
