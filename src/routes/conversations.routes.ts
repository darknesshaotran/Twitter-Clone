import express from 'express'
import { getConversationController } from '~/controllers/conversations.controllers'
import { PaginationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, conversationValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapController } from '~/utils/handler'
const conversationRouter = express.Router()

conversationRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifyUserValidator,
  conversationValidator,
  PaginationValidator,
  wrapController(getConversationController)
)
/*
 * description : get message from receiver
 * path : /receiver/:receiver_id
 * method : GET
 * headers : { Authorization: Bearer <access_token> }
 */
export default conversationRouter
