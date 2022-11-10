import express from 'express'
import cors from 'cors'
import { router } from './routes'

const app = express()

app.use(express.json())
app.use(cors({
  origin: '*'
}))
app.use(router)

app.listen(process.env.PORT ?? 8000, () => console.log('Server is running'))
