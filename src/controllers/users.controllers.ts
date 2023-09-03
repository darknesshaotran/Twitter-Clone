import { config } from 'dotenv'
import { Response, Request, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { registerReqBody, updateMyProfileReqBody } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
config()

export const loginController = async (req: Request, res: Response) => {
  const { user }: any = req
  const userID: ObjectId = user._id
  const result = await usersService.login(userID.toString(), user.verify)
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result: result
  })
}

export const OAuthcontroller = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await usersService.oauth(code as string)
  const urlRedirect = `${envConfig.CLIENT_HOME_REDIRECT}?access_token=${result.AccessToken}&refresh_token=${result.Refresh_token}
                        &newUser=${result.newUser}&verify=${result.verify}`
  // redirect ve trang chu client kem theo access token, client luu token vao localstorage hoac cookies -> login success
  return res.redirect(urlRedirect)
}

export const registerController = async (req: Request<ParamsDictionary, any, registerReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result: result
  })
}

export const logoutController = async (req: Request, res: Response) => {
  const { Refresh_token }: any = req.body
  const result = await usersService.logout(Refresh_token)
  res.json({
    message: result.message
  })
}

export const refreshTokenController = async (req: Request, res: Response) => {
  const { decoded_refresh_token }: any = req
  const { Refresh_token } = req.body
  const { userId, verify, exp }: any = decoded_refresh_token
  const result = await usersService.refreshToken(userId, verify, exp, Refresh_token)
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const emailVerifyController = async (req: Request, res: Response) => {
  const { decoded_email_verify_token }: any = req
  // decoded_email_verify_token: { userID,token_type}
  const { userId }: any = decoded_email_verify_token
  const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
  // neu khong tim thay nguoi dung thif bao loi
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USERS_MESSAGES.USER_NOT_FOUND })
  }
  // da verify r thi se ko bao loi va tra ve status 200
  if (user.email_verify_token === '' && user.verify === UserVerifyStatus.Verified) {
    return res.json({ message: USERS_MESSAGES.EMAIL_VERIFIED })
  }

  // thuc hien verify sau khi pass 2 vong if tren
  const result = await usersService.verifyEmail(userId)
  return res.json({
    message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_VERIFIED
    })
  }
  const result = await usersService.resendVerifyEmail(userId, user.email)
  res.json(result)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { user }: any = req
  const { _id }: any = user
  const result = await usersService.forgotPassword(_id.toString(), user.verify, user.email)
  res.json(result)
}

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const { decoded_forgot_password_token }: any = req
  const { userId }: any = decoded_forgot_password_token
  const { password } = req.body
  const result = await usersService.resetPassword(userId, password)
  res.json(result)
}

export const getMyInforController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const result = await usersService.getMe(userId)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request, res: Response) => {
  const { username } = req.params
  const result = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result
  })
}

export const updateMyInforController = async (
  req: Request<ParamsDictionary, any, updateMyProfileReqBody>,
  res: Response
) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const user = await usersService.updateMyProfile(userId, req.body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_MY_PROFILE_SUCCESS,
    result: user
  })
}

export const followController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const { follower_user_id } = req.body
  const result = await usersService.follow(userId, follower_user_id)
  res.json(result)
}

export const unFollowController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const { follower_user_id } = req.params
  const result = await usersService.unfollow(userId, follower_user_id)
  res.json(result)
}

export const changePasswordController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const { password } = req.body
  const result = await usersService.changePassword(userId, password)
  res.json(result)
}
