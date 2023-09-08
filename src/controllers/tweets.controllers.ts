import { config } from 'dotenv'
import { Response, Request, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enums'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { TweetRequestBody, updateTweetReqBody } from '~/models/requests/Tweet.requests'
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

export const deleteTweetController = async (req: Request, res: Response) => {
  const { tweet }: any = req
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const result = await TweetsService.deleteTweet(userId, tweet)
  res.json(result)
}
export const getTweetChildrenController = async (req: Request, res: Response) => {
  const { tweet }: any = req
  const { decoded_authorization }: any = req
  const userId = decoded_authorization?.userId
  const { limit, page, tweet_type } = req.query
  const { total, tweets } = await TweetsService.getTweetsChildren(
    tweet._id,
    Number(page),
    Number(limit),
    Number(tweet_type) as TweetType,
    userId
  )
  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    result: {
      tweets,
      page: Number(page),
      tweet_type: Number(tweet_type),
      total_page: Math.ceil(total / Number(limit))
    }
  })
}

export const getNewFeedsController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const userId = decoded_authorization.userId
  const { limit, page } = req.query
  const { tweets, total } = await TweetsService.getNewFeeds(userId, Number(limit), Number(page))
  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    result: tweets,
    total_page: Math.ceil(total / Number(limit)),
    page: Number(page)
    // total_page: Math.ceil(total / Number(limit))
  })
}

export const updateTweetController = async (req: Request<ParamsDictionary, any, updateTweetReqBody>, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const { tweet }: any = req
  const _tweet = await TweetsService.updateTweet(userId, tweet, req.body)
  return res.json({
    message: TWEETS_MESSAGES.UPDATE_TWEET_SUCCESS,
    result: _tweet
  })
}
