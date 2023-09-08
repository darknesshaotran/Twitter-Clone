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
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    return { conversations, total_page, page, limit }
  }

  async getListConversations(userID: string, limit: number, page: number) {
    const listConversation = await databaseService.conversations
      .aggregate([
        {
          $match: {
            $or: [
              {
                sender_id: new ObjectId(userID)
              },
              {
                receiver_id: new ObjectId(userID)
              }
            ]
          }
        },
        {
          $addFields: {
            participant_id: {
              $cond: {
                if: {
                  $eq: ['$sender_id', new ObjectId(userID)]
                },
                then: '$receiver_id',
                else: '$sender_id'
              }
            }
          }
        },
        {
          $group: {
            _id: '$participant_id',
            created_at: {
              $last: '$created_at'
            },
            content: {
              $last: '$content'
            },
            // Lấy nội dung tin nhắn tại thời điểm gần nhất
            id_sender: {
              $last: '$sender_id'
            },
            id_conversation: {
              $last: '$_id'
            }
          }
        },
        {
          $sort: {
            created_at: -1
          }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'chatting_user'
          }
        },
        {
          $unwind: '$chatting_user'
        },
        {
          $project: {
            _id: '$id_conversation',
            receiver_id: '$_id',
            created_at: 1,
            content: 1,
            id_sender: 1,
            chatting_user: 1
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'id_sender',
            foreignField: '_id',
            as: 'sended_content_user'
          }
        },
        {
          $unwind: '$sended_content_user'
        },
        {
          $project: {
            tweet_children: 0,
            chatting_user: {
              date_of_birth: 0,
              password: 0,
              email_verify_token: 0,
              forgot_password_token: 0,
              twitter_circle: 0,
              created_at: 0,
              updated_at: 0,
              verify: 0,
              bio: 0,
              cover_photo: 0,
              location: 0,
              website: 0
            },
            sended_content_user: {
              date_of_birth: 0,
              password: 0,
              email_verify_token: 0,
              forgot_password_token: 0,
              twitter_circle: 0,
              created_at: 0,
              updated_at: 0,
              verify: 0,
              bio: 0,
              cover_photo: 0,
              location: 0,
              website: 0
            }
          }
        }
      ])
      .toArray()
    return {
      message: 'get conversation list successfully',
      conversation: listConversation,
      total_page: Math.ceil(listConversation.length / limit),
      page: page
    }
  }
}
const conversationService = new ConversationService()
export default conversationService
