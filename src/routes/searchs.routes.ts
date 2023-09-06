import express from 'express'
import { searchController, searchHashtagsController } from '~/controllers/searchs.controllers'
import { searchValidator } from '~/middlewares/searchs.middlewares'
import { PaginationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, isUserLoggedInValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapController } from '~/utils/handler'
const searchRouter = express.Router()

searchRouter.get(
  '/hashtag',
  PaginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  searchValidator,
  wrapController(searchHashtagsController)
)
searchRouter.get(
  '/',
  PaginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  searchValidator,
  wrapController(searchController)
)
export default searchRouter
