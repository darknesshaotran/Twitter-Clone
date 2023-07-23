import express from 'express'
import { searchController } from '~/controllers/searchs.controllers'
import { PaginationValidator } from '~/middlewares/tweets.middleware'
const searchRouter = express.Router()

searchRouter.get('/', PaginationValidator, searchController)
export default searchRouter
