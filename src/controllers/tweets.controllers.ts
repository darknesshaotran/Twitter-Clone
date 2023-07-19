import { config } from 'dotenv'
import { Response, Request, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from '~/services/database.services'
import TweetsService from '~/services/tweets.services'
config()
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const result = await TweetsService.createTweet(userId, req.body)
  return res.json({
    message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESS,
    result
  })
}

export const getTweetController = async (req: Request, res: Response) => {
  const { tweet }: any = req
  const { decoded_authorization }: any = req
  const userId = decoded_authorization?.userId
  const result = await TweetsService.increaseView(tweet._id, userId)
  const finalTweet = {
    ...tweet,
    ...result
  }
  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    result: finalTweet
  })
}
