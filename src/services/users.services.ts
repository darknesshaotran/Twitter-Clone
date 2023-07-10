import User from '~/models/schemas/User.schema'

import databaseService from './database.services'
import { registerReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import dotenv from 'dotenv'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
dotenv.config()
class UsersService {
  private signAccessToken = (userId: string) => {
    return signToken({
      payload: {
        userId: userId,
        type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken = (userId: string) => {
    return signToken({
      payload: {
        userId: userId,
        type: TokenType.RefreshToken
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
  private signEmailVerifyToken = (userId: string) => {
    return signToken({
      payload: {
        userId: userId,
        type: TokenType.EmailVerifyToken
      },
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }
  private signForgotPasswordToken = (userId: string) => {
    return signToken({
      payload: {
        userId: userId,
        type: TokenType.ForgotPasswordToken
      },
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  async checkExistedEmail(email: string) {
    const result = await databaseService.users.findOne({ email: email })
    return Boolean(result)
  }

  async findUser(email: string, password: string) {
    const user = await databaseService.users.findOne({ email: email, password: hashPassword(password) })
    return user
  }

  ///////////// REGISTER FUNCTIONS //////////////
  async register(payload: registerReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const userID = result.insertedId.toString()
    const [EmailVerifyToken, AccessToken, RefreshToken] = await Promise.all([
      this.signEmailVerifyToken(userID),
      this.signAccessToken(userID),
      this.signRefreshToken(userID)
    ])
    await databaseService.users.updateOne(
      { _id: new ObjectId(userID) },
      {
        $set: {
          email_verify_token: EmailVerifyToken
        }
      }
    )
    console.log(EmailVerifyToken)
    return {
      AccessToken,
      RefreshToken
    }
  }

  async login(userID: string) {
    const [AccessToken, Refresh_token] = await Promise.all([
      this.signAccessToken(userID),
      this.signRefreshToken(userID)
    ])
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(userID), token: Refresh_token })
    )
    return {
      AccessToken,
      Refresh_token
    }
  }

  async logout(Refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: Refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(userID: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(userID) },
      {
        $set: {
          email_verify_token: '',
          updated_at: new Date(),
          verify: UserVerifyStatus.Verified
        }
      }
    )
    const [AccessToken, Refresh_token] = await Promise.all([
      this.signAccessToken(userID),
      this.signRefreshToken(userID)
    ])
    return {
      AccessToken,
      Refresh_token
    }
  }

  async resendVerifyEmail(userID: string) {
    const email_verify_token = await this.signEmailVerifyToken(userID)
    await databaseService.users.updateOne(
      { _id: new ObjectId(userID) },
      {
        $set: {
          email_verify_token: email_verify_token,
          updated_at: new Date()
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword(userID: string) {
    const forgot_password_token = await this.signForgotPasswordToken(userID)
    await databaseService.users.updateOne(
      { _id: new ObjectId(userID) },
      {
        $set: {
          forgot_password_token: forgot_password_token,
          updated_at: new Date()
        }
      }
    )
    // gửi email kèm đường link đến email người dùng : https://twitter.com/forgot-password?token=token
    // ở đây console.log tạm thay vì gửi email link token :v
    console.log('forgot password token: ', forgot_password_token)
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword(userID: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(userID) },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password),
          updated_at: new Date()
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(userID: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(userID) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
}

const usersService = new UsersService()
export default usersService
