import express from 'express'
import { BookmarkTweetController, UnBookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { Tweet_IdValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapController } from '~/utils/handler'
const bookmarkRouter = express.Router()

bookmarkRouter.post('/', accessTokenValidator, verifyUserValidator, wrapController(BookmarkTweetController))
/*
 * description : bookmark tweet
 * path : /
 * method : POST
 *  body : { id_tweet: string}
 * headers : { Authorization: Bearer <access_token> }
 */
bookmarkRouter.delete(
  '/unbookmark/:tweet_id',
  accessTokenValidator,
  verifyUserValidator,
  Tweet_IdValidator,
  wrapController(UnBookmarkTweetController)
)
/*
 * description : unbookmark tweet
 * path : /unbookmark/:tweet_id
 * method : DELETE
 * headers : { Authorization: Bearer <access_token> }
 */
// NOTE : co the unbookmark bang bookmark_id thay vi tweet_id nhu tren

export default bookmarkRouter
