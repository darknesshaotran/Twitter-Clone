import { Response, Request, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorsWithStatus } from '~/models/Errors'
import usersService from '~/services/users.services'
import { validate } from '~/utils/validation'
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      message: 'missing email or password'
    })
  }
  next()
}

const checkRegisterValidator = checkSchema({
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
})

export const registerValidator = validate(checkRegisterValidator)
