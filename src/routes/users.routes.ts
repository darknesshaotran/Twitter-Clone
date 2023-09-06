import express from 'express'
import {
  OAuthcontroller,
  changePasswordController,
  emailVerifyController,
  followController,
  forgotPasswordController,
  getListFollowingController,
  getListfollowerController,
  getMyInforController,
  getProfileController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unFollowController,
  updateMyInforController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMyProfileValidator,
  verifyForgotPasswordTokenValidator,
  verifyUserValidator
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
usersRouter.post('/refresh_token', refreshTokenValidator, wrapController(refreshTokenController))
/*
 * description : delete refresh token and add new refresh token to database, everytime when access token is expired
 * path : /refresh_token
 * method : POST
 *  body : {
        Refresh_token: string
    }
 */
usersRouter.get('/oauth/google', wrapController(OAuthcontroller))
/* 
sử dụng link sau để test oauth : "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=46501919659-k16co3keoadtnq1s5la4qgq832e8a95n.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fusers%2Foauth%2Fgoogle&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&prompt=consent&access_type=offline&service=lso&o2v=2&flowName=GeneralOAuthFlow"
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
usersRouter.get('/me', accessTokenValidator, wrapController(getMyInforController))
/*
 * description : get my infor
 * path : /me
 * method : GET
 * headers : { Authorization: Bearer <access_token> }
 *  body : {}
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifyUserValidator,
  updateMyProfileValidator,
  wrapController(updateMyInforController)
)
/*
 * description : update my profile
 * path : /me
 * method : PATCH
 * headers : { Authorization: Bearer <access_token> }
 *  body : {
 *      name ?: string
 *      date_of_birth ?: string
 *      bio ?: string
 *      location?: string
 *      website?: string
 *      username?: string
 *      avatar?: string
 *      cover_photo?: string
 * }
 */
usersRouter.get('/following', accessTokenValidator, verifyUserValidator, wrapController(getListFollowingController))
/*
 * description : get list Following
 * path : /following
 * method : GET
 * headers : { Authorization: Bearer <access_token> }
 */
usersRouter.get('/follower', accessTokenValidator, verifyUserValidator, wrapController(getListfollowerController))
/*
 * description : get list follower
 * path : /follower
 * method : GET
 * headers : { Authorization: Bearer <access_token> }
 */
usersRouter.get('/:username', wrapController(getProfileController))
/*
 * description : get user profile
 * path : /:username
 * method : GET
 *  body : {}
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifyUserValidator,
  followValidator,
  wrapController(followController)
)
/*
 * description : follow someone
 * path : /follow
 * method : POST
 * headers : { Authorization: Bearer <access_token> }
 *  body : {
 *    follower_user_id: string
 * }
 */
usersRouter.delete(
  '/unfollow/:follower_user_id',
  accessTokenValidator,
  verifyUserValidator,
  unFollowValidator,
  wrapController(unFollowController)
)
/*
 * description : unfollow someone
 * path : /unfollow/:follower_user_id
 * method : DELETE
 * headers : { Authorization: Bearer <access_token> }
 *  body : {}
 */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifyUserValidator,
  changePasswordValidator,
  wrapController(changePasswordController)
)
/*
 * description : change password
 * path : /change-password
 * method : PUT
 * headers : { Authorization: Bearer <access_token> }
 *  body : {
 *    old_password: string
 *    password : string
 *    confirm_password: string
 * }
 */
export default usersRouter
