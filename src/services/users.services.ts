import User from '~/models/schemas/User.schema'

import databaseService from './database.services'
import { registerReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
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
    const [AccessToken, RefreshToken] = await Promise.all([this.signAccessToken(userID), this.signRefreshToken(userID)])
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
}

const usersService = new UsersService()
export default usersService
