import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorsWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
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
      notEmpty: {
        errorMessage: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED
      },
      custom: {
        options: async (value: string, { req }) => {
          const accessToken = value.split(' ')[1]
          const decoded_authorization = await verifyToken({ token: accessToken })
          const Refresh_token = databaseService.refreshTokens.findOne({ token: value })
          console.log(Refresh_token)
          if (Refresh_token === null) {
            throw new ErrorsWithStatus({
              message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
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
      notEmpty: {
        errorMessage: USERS_MESSAGES.REFRESH_TOKEN_REQUIRED
      },
      custom: {
        options: async (value: string, { req }) => {
          const decoded_refresh_token = await verifyToken({ token: value })
          return true
        }
      }
    }
  },
  ['body']
)
export const registerValidator = validate(checkRegisterValidator)
export const loginValidator = validate(checkLoginValidator)
export const accessTokenValidator = validate(checkAccessTokenValidator)
export const refreshTokenValidator = validate(checkRefreshTokenValidator)
