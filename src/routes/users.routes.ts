import express from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapController } from '~/utils/handler'
const usersRouter = express.Router()
usersRouter.post('/login', loginValidator, wrapController(loginController))
usersRouter.post('/register', registerValidator, wrapController(registerController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapController(logoutController))

export default usersRouter
