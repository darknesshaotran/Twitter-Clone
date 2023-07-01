import { Response, Request, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
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
    notEmpty: true,
    isString: true,
    isLength: {
      options: {
        max: 50,
        min: 1
      }
    },
    trim: true
  },
  email: {
    isEmail: true,
    notEmpty: true,
    trim: true
  },
  password: {
    notEmpty: true,
    isString: true,
    isStrongPassword: {
      options: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0
      },
      errorMessage: 'the password must be at least 8 characters long'
    }
  },
  confirm_password: {
    notEmpty: true,
    isString: true,
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('password confirm does not match password !')
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
      }
    }
  }
})

export const registerValidator = validate(checkRegisterValidator)
