import User from '~/models/schemas/User.schema'
import axios from 'axios'
import databaseService from './database.services'
import { registerReqBody, updateMyProfileReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
// import dotenv from 'dotenv'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorsWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import Follower from '~/models/schemas/Follower.schema'
import { sendVerifyEmail } from '~/utils/email'
import { envConfig } from '~/constants/config'
// dotenv.config()
class UsersService {
  private signAccessToken = (userId: string, verifyStatus: UserVerifyStatus) => {
    return signToken({
      payload: {
        userId: userId,
        verify: verifyStatus,
        type: TokenType.AccessToken
      },
      options: {
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken = (userId: string, verifyStatus: UserVerifyStatus, expiresIn?: number) => {
    if (expiresIn) {
      return signToken({
        payload: {
          userId: userId,
          verify: verifyStatus,
          type: TokenType.RefreshToken,
          exp: expiresIn
        }
      })
    } else {
      return signToken({
        payload: {
          userId: userId,
          verify: verifyStatus,
          type: TokenType.RefreshToken
        },
        options: {
          expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN
        }
      })
    }
  }
  private signEmailVerifyToken = (userId: string, verifyStatus: UserVerifyStatus) => {
    return signToken({
      payload: {
        userId: userId,
        verify: verifyStatus,
        type: TokenType.EmailVerifyToken
      },
      options: {
        expiresIn: envConfig.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }
  private signForgotPasswordToken = (userId: string, verifyStatus: UserVerifyStatus) => {
    return signToken({
      payload: {
        userId: userId,
        verify: verifyStatus,
        type: TokenType.ForgotPasswordToken
      },
      options: {
        expiresIn: envConfig.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }
  private getOAuthGoogleToken = async (code: string) => {
    const body = {
      code,
      client_id: envConfig.GOOGLE_CLIENT_ID,
      client_secret: envConfig.GOOGLE_CLIENT_SECRET,
      redirect_uri: envConfig.GOOGLE_REDIRECT_URL,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return data
  }
  private getGoogleUserInfo = async (access_token: string, id_token: string) => {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data
  }
  async checkExistedEmail(email: string) {
    const result = await databaseService.users.findOne({ email: email })
    return Boolean(result)
  }

  async findUser(email: string, password: string) {
    const user = await databaseService.users.findOne({ email: email, password: hashPassword(password) })
    return user
  }

  private decodeRefreshToken = async (Refresh_token: string) => {
    const decoded_refresh_token = await verifyToken({ token: Refresh_token })
    return decoded_refresh_token
  }

  ///////////// MAIN FUNCTIONS //////////////
  async register(payload: registerReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const userID = result.insertedId.toString()
    const [EmailVerifyToken, AccessToken, Refresh_token] = await Promise.all([
      this.signEmailVerifyToken(userID, UserVerifyStatus.Unverified),
      this.signAccessToken(userID, UserVerifyStatus.Unverified),
      this.signRefreshToken(userID, UserVerifyStatus.Unverified)
    ])
    await databaseService.users.updateOne(
      { _id: new ObjectId(userID) },
      {
        $set: {
          username: `user${userID}`,
          email_verify_token: EmailVerifyToken
        }
      }
    )
    console.log('email verify token: ', EmailVerifyToken)
    await sendVerifyEmail(
      payload.email,
      'Verify email',
      `
        <h1>Verify your email</h1>
        <p>click 
          <a href="${envConfig.CLIENT_HOME_REDIRECT}/verify-email?token=${EmailVerifyToken}">Here</a>
          to verify your email
        </p>
      `
    )
    return {
      AccessToken,
      Refresh_token
    }
  }

  async login(userID: string, verify: UserVerifyStatus) {
    const [AccessToken, Refresh_token] = await Promise.all([
      this.signAccessToken(userID, verify),
      this.signRefreshToken(userID, verify)
    ])
    const decoded_refresh_token = await this.decodeRefreshToken(Refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(userID),
        token: Refresh_token,
        exp: decoded_refresh_token.exp as number
      })
    )
    return {
      AccessToken,
      Refresh_token
    }
  }

  async oauth(code: string) {
    const data = await this.getOAuthGoogleToken(code)
    const { id_token, access_token } = data
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorsWithStatus({
        message: USERS_MESSAGES.EMAIL_IS_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const user = await databaseService.users.findOne({ email: userInfo.email })
    if (user) {
      const data = await this.login(user._id.toString(), user.verify)
      return {
        ...data,
        newUser: false,
        verify: user.verify
      }
    } else {
      const password = Math.random().toString(36).substring(2, 15)
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password: password,
        confirm_password: password
      })
      return {
        ...data,
        newUser: true,
        verify: UserVerifyStatus.Unverified
      }
    }
  }

  async logout(Refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: Refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async refreshToken(userID: string, verify: UserVerifyStatus, exp: number, refresh_token: string) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(userID, verify),
      this.signRefreshToken(userID, verify, exp),
      databaseService.refreshTokens.deleteOne({ token: refresh_token })
    ])
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(userID), token: new_refresh_token, exp: exp })
    )
    return {
      AccessToken: new_access_token,
      Refresh_token: new_refresh_token
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
    const data = await this.login(userID, UserVerifyStatus.Verified)
    return {
      ...data
    }
  }

  async resendVerifyEmail(userID: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken(userID, UserVerifyStatus.Unverified)
    await sendVerifyEmail(
      email,
      'Verify email',
      `
        <h1>Verify your email</h1>
        <p>click 
          <a href="${envConfig.CLIENT_HOME_REDIRECT}/verify-email?token=${email_verify_token}">Here</a>
          to verify your email
        </p>
      `
    )
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

  async forgotPassword(userID: string, verify: UserVerifyStatus, email: string) {
    const forgot_password_token = await this.signForgotPasswordToken(userID, verify)
    await sendVerifyEmail(
      email,
      'forgot password email',
      `
        <h1>forgot password email</h1>
        <p>click 
          <a href="${envConfig.CLIENT_HOME_REDIRECT}/reset-password?token=${forgot_password_token}">Here</a>
          to reset your password
        </p>
      `
    )
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

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username: username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          updated_at: 0,
          created_at: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorsWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  async updateMyProfile(userID: string, payload: updateMyProfileReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    // findOneAndUpdate: sau khi update, tra ve document cua collection da update
    // updateOne : chi update, khong tra ve document cua collection da update
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(userID) },
      {
        $set: {
          ...(_payload as updateMyProfileReqBody & { date_of_birth?: Date }),
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after', // neu khong co tham so nay thi default tra ve ban document cu chua update
        // khi tra ve user thi ko tra ve cac column nay
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user.value
  }

  async getListFollowedByMe(userID: string) {
    const follower_user_ids = await databaseService.followers
      .find(
        { user_id: new ObjectId(userID) },
        {
          projection: {
            follower_user_id: 1
          }
        }
      )
      .toArray()
    // danh sach mang objectId nhung nguoi ma minh follow
    const ids = follower_user_ids.map((follower_user_id) => follower_user_id.follower_user_id)
    const follower = await databaseService.users
      .aggregate([
        {
          $match: {
            _id: {
              $in: ids
            }
          }
        },
        {
          $project: {
            date_of_birth: 0,
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            twitter_circle: 0
          }
        }
      ])
      .toArray()

    return {
      message: USERS_MESSAGES.GET_LIST_FOLLOWING,
      following: follower
    }
  }

  async getListFollower(userID: string) {
    const followers = await databaseService.followers
      .find(
        { follower_user_id: new ObjectId(userID) },
        {
          projection: {
            user_id: 1
          }
        }
      )
      .toArray()
    // danh sach mang objectId nhung nguoi follow mình
    const ids = followers.map((follower) => follower.user_id)
    const follower = await databaseService.users
      .aggregate([
        {
          $match: {
            _id: {
              $in: ids
            }
          }
        },
        {
          $project: {
            date_of_birth: 0,
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            twitter_circle: 0
          }
        }
      ])
      .toArray()

    return {
      message: USERS_MESSAGES.GET_LIST_FOLLOWER,
      follower: follower
    }
  }

  async getListAccountCanKnow(userID: string, page: number, limit: number) {
    const follower_users = await databaseService.followers
      .find(
        { user_id: new ObjectId(userID) },
        {
          projection: {
            follower_user_id: 1
          }
        }
      )
      .toArray()
    // danh sach mang objectId nhung nguoi ma minh follow
    const id_list_followers = follower_users.map((follower_user) => follower_user.follower_user_id)

    // get ra danh sách những người được follow bởi "những người mà mình đang follow"
    const followingAccoutOfFollowers = await databaseService.followers
      .find(
        {
          user_id: {
            $in: id_list_followers
          }
        },
        {
          projection: {
            follower_user_id: 1
          }
        }
      )
      .toArray()
    //danh sách mảng objectId những người được follow bởi "những người mà mình đang follow"
    const id_List_User_Hint = followingAccoutOfFollowers.map(
      (followingAccoutOfFollower) => followingAccoutOfFollower.follower_user_id
    )

    // loại bỏ các phẩn tử objectId trùng lặp
    const id_List_User_Hint_distinct = new Set(id_List_User_Hint.map((id) => id.toString())) // Chuyển ObjectId thành chuỗi và sử dụng Set để loại bỏ trùng lặp
    const id_List_User_Hint_distinct_new = [...id_List_User_Hint_distinct].map((id) => new ObjectId(id)) // Chuyển lại thành ObjectId

    // loai bo cac userID đã follow
    const id_List_User_Hint_distinct_final = id_List_User_Hint_distinct_new.filter(
      (id) => !id_list_followers.some((id_list_follower) => id_list_follower.equals(id))
    )

    const ListUserHint = await databaseService.users
      .aggregate([
        {
          $match: {
            _id: {
              $in: id_List_User_Hint_distinct_final
            }
          }
        },
        {
          $project: {
            date_of_birth: 0,
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            twitter_circle: 0
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    return {
      message: USERS_MESSAGES.GET_LIST_HINT_USER,
      listHintUser: ListUserHint
    }
  }

  async follow(userID: string, follower_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(userID),
      follower_user_id: new ObjectId(follower_user_id)
    })
    if (follower === null) {
      const result = await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(userID),
          follower_user_id: new ObjectId(follower_user_id),
          created_at: new Date()
        })
      )
      return {
        message: USERS_MESSAGES.FOLLOW_SUCCESS
      }
    }
    return {
      message: USERS_MESSAGES.FOLLOWED
    }
  }

  async unfollow(userID: string, follower_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(userID),
      follower_user_id: new ObjectId(follower_user_id)
    })
    if (follower === null) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(userID),
      follower_user_id: new ObjectId(follower_user_id)
    })
    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS
    }
  }

  async changePassword(userID: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(userID) },
      {
        $set: {
          password: hashPassword(password),
          updated_at: new Date()
        }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASS_SUCCESS
    }
  }
}

const usersService = new UsersService()
export default usersService
