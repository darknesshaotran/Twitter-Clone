import { config } from 'dotenv'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmark.schema'
import { TweetType } from '~/constants/enums'

config()
class bookmarksService {
  async bookmarkTweet(userID: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(userID),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({
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

  async unBookmarkTweet(userID: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(userID),
      tweet_id: new ObjectId(tweet_id)
    })
    return result.value
  }

  async getBookmarkedTweet(userID: string, limit: number, page: number) {
    const tweetList = await databaseService.bookmarks
      .find({
        user_id: new ObjectId(userID)
      })
      .toArray()
    // get ra danh sách id tweet mà mình từng bookmarks
    const idTweets = tweetList.map((tweet) => tweet.tweet_id)

    const tweets = await databaseService.tweets
      .aggregate([
        {
          $match: {
            _id: {
              $in: idTweets
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user'
          }
        },
        {
          $match: {
            $or: [
              {
                audience: 0
              },
              {
                $and: [
                  {
                    audience: 1
                  },
                  {
                    $expr: {
                      $in: [new ObjectId(userID), '$user.twitter_circle']
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0,
            user: {
              date_of_birth: 0,
              password: 0,
              email_verify_token: 0,
              forgot_password_token: 0,
              twitter_circle: 0
            }
          }
        }
      ])
      .toArray()

    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: idTweets
        }
      },
      {
        $inc: { user_views: 1 }
      }
    )
    // cap nhap tweets tra ve client
    tweets.forEach((tweet) => {
      tweet.user_views += 1
    })
    const total = tweetList.length
    return { tweets, total: total }
  }
}
const BookmarksService = new bookmarksService()
export default BookmarksService
