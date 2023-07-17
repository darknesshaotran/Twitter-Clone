import express from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweets.controllers'
import { CreateTweetValidator, Tweet_IdValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapController } from '~/utils/handler'

const tweetsRouter = express.Router()
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  CreateTweetValidator,
  wrapController(createTweetController)
)
/*
 * description : create tweet
 * path : /
 * method : POST
 *  body : TweetRequestBody
 * headers : { Authorization: Bearer <access_token> }
 */
tweetsRouter.get('/:tweet_id', Tweet_IdValidator, wrapController(getTweetController))
/*
 * description : unbookmark tweet
 * path : /unbookmark/:tweet_id
 * method : DELETE
 * headers : { Authorization: Bearer <access_token> }
 */
export default tweetsRouter
