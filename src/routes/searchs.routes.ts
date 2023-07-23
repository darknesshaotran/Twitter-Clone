import express from 'express'
import { searchController } from '~/controllers/searchs.controllers'
import { searchValidator } from '~/middlewares/searchs.middlewares'
import { PaginationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapController } from '~/utils/handler'
const searchRouter = express.Router()

searchRouter.get(
  '/',
  PaginationValidator,
  accessTokenValidator,
  verifyUserValidator,
  searchValidator,
  wrapController(searchController)
)
export default searchRouter
