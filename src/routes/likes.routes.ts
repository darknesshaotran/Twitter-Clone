import express from 'express'
import { UnlikeTweetController, getLikedTweetController, likeTweetController } from '~/controllers/likes.controllers'
import { PaginationValidator, Tweet_IdValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapController } from '~/utils/handler'
const likeRouter = express.Router()

likeRouter.post('/', accessTokenValidator, verifyUserValidator, wrapController(likeTweetController))
/*
 * description : like tweet
 * path : /
 * method : POST
 *  body : { id_tweet: string}
 * headers : { Authorization: Bearer <access_token> }
 */
likeRouter.delete(
  '/unlike/:tweet_id',
  accessTokenValidator,
  verifyUserValidator,
  Tweet_IdValidator,
  wrapController(UnlikeTweetController)
)
/*
 * description : unlike tweet
 * path : /unlike/:tweet_id
 * method : DELETE
 * headers : { Authorization: Bearer <access_token> }
 */
// NOTE : co the unlike bang like_id thay vi tweet_id nhu tren
likeRouter.get(
  '/List',
  PaginationValidator,
  accessTokenValidator,
  verifyUserValidator,
  wrapController(getLikedTweetController)
)

export default likeRouter
