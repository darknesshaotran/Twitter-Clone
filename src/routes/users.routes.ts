import express from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapController } from '~/utils/handler'
const usersRouter = express.Router()
usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', registerValidator, wrapController(registerController))

export default usersRouter
