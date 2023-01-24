import { Router } from 'express'
import { isAuth } from '../controllers/auth/isAuth.controller'
import { SignIn } from '../controllers/auth/signIn.controller'
import { SignUp } from '../controllers/auth/signUp.controller'

const authRouter = Router()

authRouter.post('/signup', SignUp)
authRouter.post('/login', SignIn)
authRouter.get('/isAuth', isAuth)

export { authRouter }
