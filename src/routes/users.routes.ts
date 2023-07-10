import express from 'express'
import {
  emailVerifyController,
  forgotPasswordController,
  getMyInforController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapController } from '~/utils/handler'
const usersRouter = express.Router()
usersRouter.post('/login', loginValidator, wrapController(loginController))
/*
 * path : /login
 * method : POST
 *  body : {
        email : string,
        password : string
    }
 */
usersRouter.post('/register', registerValidator, wrapController(registerController))
/*
 * path : /register
 * method : POST
 *  body : {
        email : string,
        password : string,
        name: string,
        date_of_birth : ISO8601String,
        confirm_password: string
    }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapController(logoutController))
/*
 * description : click logout btn ,delete refresh token on db
 * path : /logout
 * method : POST
 * headers : { Authorization: Bearer <access_token> }
 *  body : {
        Refresh_token: string
    }
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapController(emailVerifyController))
/*
 * description : click on a link on email to verify account and automatically login
 * path : /verify-email
 * method : POST
 *  body : { 
        Email_verify_token: string
 *  } 
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapController(resendEmailVerifyController))
/*
 * description : click button to resend verify email
 * path : /resend-verify-email
 * method : POST
 * headers : { Authorization: Bearer <access_token> }
 *  body : {}
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapController(forgotPasswordController))
/*
 * description : submit email and send forgot_password_token to reset password
 * path : /forgot-password
 * method : POST
 *  body : {
 *      email: string
 * }
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapController(verifyForgotPasswordController)
)
/*
 * description : verify token link in email to reset password
 * path : /verify-forgot-password
 * method : POST
 *  body : {
 *      forgot_password_token: string
 * }
 */
usersRouter.get('/me', accessTokenValidator, wrapController(getMyInforController))
/*
 * description : reset password
 * path : /reset-password
 * method : POST
 *  body : {
 *      forgot_password_token: string
 *      password: string
 *      confirm_password: string
 * }
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapController(resetPasswordController))
/*
 * description : reset password
 * path : /reset-password
 * method : POST
 *  body : {
 *      forgot_password_token: string
 *      password: string
 *      confirm_password: string
 * }
 */
export default usersRouter
