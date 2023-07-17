import { options } from 'axios'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorsWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'
const checkCreateTweetValidator = checkSchema(
  {
    type: {
      isIn: {
        options: [numberEnumToArray(TweetType)],
        errorMessage: TWEETS_MESSAGES.TYPE_IS_IN_DEFAULT
      }
    },
    audience: {
      isIn: {
        options: [numberEnumToArray(TweetAudience)],
        errorMessage: TWEETS_MESSAGES.AUDIENCE_IS_IN_DEFAULT
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const { type } = req.body
          // neu type la retweet, comment, quotetweet thi parent_id phai la tweet_id
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_VALID_TWEET_ID)
          }
          // neu type la tweet thi parent_id phai la null
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: {
        errorMessage: TWEETS_MESSAGES.CONTENT_MUST_BE_STRING
      },
      custom: {
        options: (value, { req }) => {
          const { type } = req.body
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // yeu cau moi phan tu trong array la string
          if (!value.every((item: any) => typeof item === 'string')) {
            throw new Error(TWEETS_MESSAGES.HASHTAG_MUST_BE_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // yeu cau moi phan tu trong array la  user_id
          if (!value.every((item: any) => ObjectId.isValid(item))) {
            throw new Error(TWEETS_MESSAGES.MENTION_MUST_BE_VALID_USER_ID)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // yeu cau moi phan tu trong array la Media object
          if (
            !value.every((item: any) => {
              return typeof item.url === 'string' && numberEnumToArray(MediaType).includes(item.type)
            })
          ) {
            throw new Error(TWEETS_MESSAGES.MEDIA_MUST_BE_ARRAY_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  },
  ['body']
)
export const CreateTweetValidator = validate(checkCreateTweetValidator)
