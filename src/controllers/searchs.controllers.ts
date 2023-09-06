import { config } from 'dotenv'
import { Response, Request, NextFunction } from 'express'
import { MediaTypeQuery } from '~/constants/enums'
import searchService from '~/services/searchs.services'
config()

export const searchController = async (req: Request, res: Response) => {
  const { content, limit, page, media_type, people_follow } = req.query
  const { decoded_authorization }: any = req
  const userId = decoded_authorization?.userId
  const { tweets, total } = await searchService.searchTweet(
    content as string,
    Number(page),
    Number(limit),
    userId,
    media_type as MediaTypeQuery,
    people_follow as string
  )
  res.json({
    message: 'search successfully',
    tweets,
    total_page: Math.ceil(total / Number(limit)),
    page: Number(page)
  })
}

export const searchHashtagsController = async (req: Request, res: Response) => {
  const { content, limit, page, media_type, people_follow } = req.query
  const { decoded_authorization }: any = req
  const userId = decoded_authorization?.userId
  const { tweets, total } = await searchService.searchHashtagsTweet(
    content as string,
    Number(page),
    Number(limit),
    userId,
    media_type as MediaTypeQuery,
    people_follow as string
  )
  res.json({
    message: 'search hashtags successfully',
    tweets,
    total_page: Math.ceil(total / Number(limit)),
    page: Number(page)
  })
}
