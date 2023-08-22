import { config } from 'dotenv'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.schema'

config()
class ConversationService {
  async getConversations(sender_id: string, receiver_id: string, limit: number, page: number) {
    const match = {
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    }
    const total = await databaseService.conversations.countDocuments(match)
    const total_page = Math.ceil(total / limit)
    const conversations = await databaseService.conversations
      .find(match)
      // .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    return { conversations, total_page, page, limit }
  }
}
const conversationService = new ConversationService()
export default conversationService
