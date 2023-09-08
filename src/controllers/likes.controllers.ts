import { Response, Request, NextFunction } from 'express'
import { LIKES_MESSAGES } from '~/constants/messages'
import likesService from '~/services/likes.services'
export const likeTweetController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const { tweet_id } = req.body
  const result = await likesService.likeTweet(userId, tweet_id)
  res.json({
    message: LIKES_MESSAGES.LIKE_TWEET_SUCCESS,
    result
  })
}

export const UnlikeTweetController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const { tweet_id } = req.params
  const result = await likesService.unlikeTweet(userId, tweet_id)
  res.json({
    message: LIKES_MESSAGES.UNLIKE_TWEET_SUCCESS,
    result
  })
}

export const getLikedTweetController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const { limit, page } = req.query
  const { tweets, total } = await likesService.getLikedTweet(userId, Number(limit), Number(page))
  res.json({
    message: 'get liked Tweets successfully',
    tweets,
    total_page: Math.ceil(total / Number(limit)),
    page: Number(page)
  })
}
