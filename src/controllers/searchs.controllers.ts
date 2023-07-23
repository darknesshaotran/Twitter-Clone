import { config } from 'dotenv'
import { Response, Request, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import searchService from '~/services/searchs.services'
import TweetsService from '~/services/tweets.services'
config()

export const searchController = async (req: Request, res: Response) => {
  const { content, limit, page } = req.query
  const { decoded_authorization }: any = req
  const userId = decoded_authorization?.userId
  const { tweets, total } = await searchService.searchTweet(content as string, Number(page), Number(limit), userId)
  res.json({
    message: 'search successfully',
    tweets,
    total_page: Math.ceil(total / Number(limit)),
    page: Number(page)
  })
}
