import { Response, Request, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorsWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const checkRegisterValidator = checkSchema(
  {
    name: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.NAME_MUST_BE_STRING
      },
      isLength: {
        options: {
          max: 50,
          min: 1
        },
        errorMessage: USERS_MESSAGES.NAME_LENGTH_FROM_1_TO_50
      },
      trim: true
    },
    email: {
      isEmail: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
      },
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
      },
      trim: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await usersService.checkExistedEmail(value)
          if (isExistEmail) {
            throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
          }
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRING
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 0,
          minNumbers: 1,
          minSymbols: 0
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
      }
    },
    confirm_password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601_FORMAT
      }
    }
  },
  ['body']
)

const checkLoginValidator = checkSchema(
  {
    email: {
      isEmail: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
      },
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
      },
      custom: {
        options: async (value, { req }) => {
          const user = await usersService.findUser(value, req.body.password)
          if (user === null) {
            throw new Error(USERS_MESSAGES.WRONG_EMAIL_OR_PASSWORD)
          }
          req.user = user
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
      }
    }
  },
  ['body']
)

const checkAccessTokenValidator = checkSchema(
  {
    Authorization: {
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          const accessToken = value.split(' ')[1]
          const decoded_authorization = await verifyToken({ token: accessToken })
          req.decoded_authorization = decoded_authorization
          return true
        }
      }
    }
  },
  ['headers']
)

const checkRefreshTokenValidator = checkSchema(
  {
    Refresh_token: {
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.REFRESH_TOKEN_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          const decoded_refresh_token = await verifyToken({ token: value })
          const Refresh_token = await databaseService.refreshTokens.findOne({ token: value })
          if (Refresh_token === null) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          req.decoded_refresh_token = decoded_refresh_token
          return true
        }
      }
    }
  },
  ['body']
)

const checkEmailVerifyTokenValidator = checkSchema(
  {
    Email_verify_token: {
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          const decoded_email_verify_token = await verifyToken({ token: value })
          req.decoded_email_verify_token = decoded_email_verify_token
          return true
        }
      }
    }
  },
  ['body']
)

const checkForgotPasswordValidator = checkSchema(
  {
    email: {
      isEmail: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
      },
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value })
          if (!user) {
            throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
          }
          req.user = user
        }
      }
    }
  },
  ['body']
)

const checkVerifyForgotPasswordTokenValidator = checkSchema(
  {
    forgot_password_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          const decoded_forgot_password_token = await verifyToken({ token: value })
          const user = await databaseService.users.findOne({
            _id: new ObjectId(decoded_forgot_password_token.userId)
          })
          if (!user) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          if (user.forgot_password_token !== value) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          return true
        }
      }
    }
  },
  ['body']
)

const checkResetPasswordValidator = checkSchema(
  {
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRING
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 0,
          minNumbers: 1,
          minSymbols: 0
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
      }
    },
    confirm_password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
          }
          return true
        }
      }
    },
    forgot_password_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          const decoded_forgot_password_token = await verifyToken({ token: value })
          const user = await databaseService.users.findOne({
            _id: new ObjectId(decoded_forgot_password_token.userId)
          })
          if (!user) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          if (user.forgot_password_token !== value) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          req.decoded_forgot_password_token = decoded_forgot_password_token
          return true
        }
      }
    }
  },
  ['body']
)

const checkUpdateMyProfileValidator = checkSchema(
  {
    name: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGES.NAME_MUST_BE_STRING
      },
      isLength: {
        options: {
          max: 50,
          min: 1
        },
        errorMessage: USERS_MESSAGES.NAME_LENGTH_FROM_1_TO_50
      },
      trim: true
    },
    date_of_birth: {
      optional: true,
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601_FORMAT
      }
    },
    bio: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGES.BIO_MUST_BE_STRING
      }
    },
    location: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_STRING
      }
    },
    website: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_STRING
      }
    },
    username: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_STRING
      },
      isLength: {
        options: {
          max: 30,
          min: 5
        },
        errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_FROM_5_TO_30
      },
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ username: value })
          if (user) {
            throw new Error(USERS_MESSAGES.USERNAME_EXISTED)
          }
          return true
        }
      }
    },
    avatar: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGES.AVATAR_MUST_BE_STRING
      }
    },
    cover_photo: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGES.COVER_PHOTO_MUST_BE_STRING
      }
    }
  },
  ['body']
)

const checkFollowValidator = checkSchema(
  {
    follower_user_id: {
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.INVALID_FOLLOWER_USER_ID,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const follower = await databaseService.users.findOne({ _id: new ObjectId(value) })
          if (follower === null) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  },
  ['body']
)
const checkConversationValidator = checkSchema(
  {
    receiver_id: {
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.INVALID_FOLLOWER_USER_ID,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const user = await databaseService.users.findOne({ _id: new ObjectId(value) })
          if (user === null) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  },
  ['params']
)
const checkUnFollowValidator = checkSchema(
  {
    follower_user_id: {
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.INVALID_FOLLOWER_USER_ID,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const follower = await databaseService.users.findOne({ _id: new ObjectId(value) })
          if (follower === null) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  },
  ['params']
)
const checkChangePasswordValidator = checkSchema(
  {
    old_password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.OLD_PASSWORD_REQUIRED
      },
      custom: {
        options: async (value, { req }) => {
          const { decoded_authorization } = req
          const { userId } = decoded_authorization
          const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
          if (!user) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const { password } = user
          if (hashPassword(value) !== password) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRING
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 0,
          minNumbers: 1,
          minSymbols: 0
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
      }
    },
    confirm_password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
          }
          return true
        }
      }
    }
  },
  ['body']
)

export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { decoded_authorization }: any = req
  const { verify }: any = decoded_authorization
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorsWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
export const registerValidator = validate(checkRegisterValidator)
export const loginValidator = validate(checkLoginValidator)
export const accessTokenValidator = validate(checkAccessTokenValidator)
export const refreshTokenValidator = validate(checkRefreshTokenValidator)
export const emailVerifyTokenValidator = validate(checkEmailVerifyTokenValidator)
export const forgotPasswordValidator = validate(checkForgotPasswordValidator)
export const verifyForgotPasswordTokenValidator = validate(checkVerifyForgotPasswordTokenValidator)
export const resetPasswordValidator = validate(checkResetPasswordValidator)
export const updateMyProfileValidator = validate(checkUpdateMyProfileValidator)
export const followValidator = validate(checkFollowValidator)
export const unFollowValidator = validate(checkUnFollowValidator)
export const changePasswordValidator = validate(checkChangePasswordValidator)
export const conversationValidator = validate(checkConversationValidator)
export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }
}
