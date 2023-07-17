import { Response, Request, NextFunction } from 'express'
import { BOOKMARKS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import BookmarksService from '~/services/bookmarks.services'
export const BookmarkTweetController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const { tweet_id } = req.body
  const result = await BookmarksService.bookmarkTweet(userId, tweet_id)
  res.json({
    message: BOOKMARKS_MESSAGES.BOOKMARK_TWEET_SUCCESS,
    result
  })
}

export const UnBookmarkTweetController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const { tweet_id } = req.params
  const result = await BookmarksService.unBookmarkTweet(userId, tweet_id)
  res.json({
    message: BOOKMARKS_MESSAGES.UNBOOKMARK_TWEET_SUCCESS,
    result
  })
}
