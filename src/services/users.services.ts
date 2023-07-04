import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { registerReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'

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

  async checkExistedEmail(email: string) {
    const result = await databaseService.users.findOne({ email: email })
    console.log(result)
    return Boolean(result)
  }
}

const usersService = new UsersService()
export default usersService
