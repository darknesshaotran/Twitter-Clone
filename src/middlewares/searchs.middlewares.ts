import { Response, Request, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaTypeQuery } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorsWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'

const checkSearchValidator = checkSchema(
  {
    content: {
      isString: true
    },
    media_type: {
      optional: true,
      isIn: {
        options: [Object.values(MediaTypeQuery)]
      },
      errorMessage: `media type must be one of ${Object.values(MediaTypeQuery).join(',')}`
    },
    people_follow: {
      optional: true,
      isIn: {
        options: [['0', '1']]
      }
    }
  },
  ['query']
)

export const searchValidator = validate(checkSearchValidator)
