import { config } from 'dotenv'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/Like.schema'

config()
class LikesService {
  async likeTweet(userID: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(userID),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(userID),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result.value
  }

  async unlikeTweet(userID: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(userID),
      tweet_id: new ObjectId(tweet_id)
    })
    return result.value
  }
}
const likesService = new LikesService()
export default likesService
