import { Response, Request, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorsWithStatus } from '~/models/Errors'
import Tweet from '~/models/schemas/Tweet.schema'
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

const checkTweet_IdValidator = checkSchema(
  {
    tweet_id: {
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new Error(TWEETS_MESSAGES.TWEET_ID_IS_INVALID)
          }
          const tweet = (
            await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',
                        as: 'mention',
                        in: {
                          _id: '$$mention._id',
                          name: '$$mention.name',
                          username: '$$mention.username',
                          email: '$$mention.email'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'tweet_children'
                  }
                },
                {
                  $addFields: {
                    bookmarks: {
                      $size: '$bookmarks'
                    },
                    likes: {
                      $size: '$likes'
                    },
                    retweet_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Retweet]
                          }
                        }
                      }
                    },
                    comment_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Comment]
                          }
                        }
                      }
                    },
                    quote_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.QuoteTweet]
                          }
                        }
                      }
                    }
                  }
                },
                {
                  $project: {
                    tweet_children: 0
                  }
                }
              ])
              .toArray()
          )[0]
          if (!tweet) {
            throw new ErrorsWithStatus({
              message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          req.tweet = tweet
          return true
        }
      }
    }
  },
  ['params']
)

const checkGetTweetsChildrenValidator = checkSchema(
  {
    tweet_type: {
      isIn: {
        options: [numberEnumToArray(TweetType)],
        errorMessage: TWEETS_MESSAGES.TYPE_IS_IN_DEFAULT
      }
    }
  },
  ['query']
)

const checkPaginationValidator = checkSchema(
  {
    limit: {
      isNumeric: true,
      custom: {
        options: (value, { req }) => {
          const num = Number(value)
          if (num > 100 || num < 1) {
            throw new Error(TWEETS_MESSAGES.TWEET_LIMIT_RANGE)
          }
          return true
        }
      }
    },
    page: {
      isNumeric: true
    }
  },
  ['query']
)
export const CreateTweetValidator = validate(checkCreateTweetValidator)
export const Tweet_IdValidator = validate(checkTweet_IdValidator)
export const GetTweetsChildrenValidator = validate(checkGetTweetsChildrenValidator)
export const PaginationValidator = validate(checkPaginationValidator)
export const AudienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { tweet }: any = req
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // kiem tra user da dang nhap hay chua
    const { decoded_authorization }: any = req
    if (!decoded_authorization) {
      throw new ErrorsWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED
      })
    }
    // kiem tra tai khoan nguoi dang tweet ( da bi ban hay bi khoa chua)
    const author = await databaseService.users.findOne({ _id: new ObjectId(tweet.user_id) })
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorsWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    // kiem tra user co nam trong twitter_circle cua author hoac user là author
    const { userId } = decoded_authorization
    const isInTwitterCircle = author.twitter_circle.some((item) => item.toString() === userId)
    if (!isInTwitterCircle && !(author._id.toString() === userId)) {
      throw new ErrorsWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      })
    }
  }
  next()
}
