import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'

config()
class tweetsService {
  async checkandCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        // tim hashtag trong database, neu khong co thi tao moi
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return hashtagDocuments.map((hashtagDocument) => (hashtagDocument.value as WithId<Hashtag>)._id)
  }

  async createTweet(userID: string, body: TweetRequestBody) {
    const hashtags = await this.checkandCreateHashtags(body.hashtags)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        type: body.type,
        audience: body.audience,
        content: body.content,
        parent_id: body.parent_id,
        hashtags: hashtags,
        mentions: body.mentions,
        medias: body.medias,
        user_id: new ObjectId(userID)
      })
    )
    const data = await databaseService.tweets.findOne({ _id: result.insertedId })
    return data
  }
}
const TweetsService = new tweetsService()
export default TweetsService
