import express from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweets.controllers'
import { AudienceValidator, CreateTweetValidator, Tweet_IdValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, isUserLoggedInValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
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
tweetsRouter.get(
  '/:tweet_id',
  Tweet_IdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  wrapController(AudienceValidator),
  wrapController(getTweetController)
)
/*
 * description : get tweet
 * path : //:tweet_id
 * method : get
 * headers : { Authorization ?: Bearer <access_token> }
 */
export default tweetsRouter
