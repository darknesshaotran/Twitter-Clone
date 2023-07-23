import express from 'express'
import { searchController } from '~/controllers/searchs.controllers'
import { PaginationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapController } from '~/utils/handler'
const searchRouter = express.Router()

searchRouter.get('/', PaginationValidator, accessTokenValidator, verifyUserValidator, wrapController(searchController))
export default searchRouter
