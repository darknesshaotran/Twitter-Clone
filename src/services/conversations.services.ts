import { config } from 'dotenv'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.schema'

config()
class ConversationService {
  async getConversations(sender_id: string, receiver_id: string) {
    const conversations = await databaseService.conversations
      .find({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id)
      })
      .toArray()
    return conversations
  }
}
const conversationService = new ConversationService()
export default conversationService
