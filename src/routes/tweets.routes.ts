import express from 'express'
import { createTweetController } from '~/controllers/tweets.controllers'
import { CreateTweetValidator } from '~/middlewares/tweets.middleware'
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
 */
export default tweetsRouter
