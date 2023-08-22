import { Response, Request, NextFunction } from 'express'
import { BOOKMARKS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import conversationService from '~/services/conversations.services'

export const getConversationController = async (req: Request, res: Response) => {
  const { decoded_authorization }: any = req
  const { userId }: any = decoded_authorization
  const sender_id = userId
  const receiver_id = req.params.receiver_id
  const { limit, page } = req.query
  // console.log(receiver_id, sender_id)
  const result = await conversationService.getConversations(sender_id, receiver_id, Number(limit), Number(page))
  res.json(result)
}
