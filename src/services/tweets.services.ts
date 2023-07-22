import { config } from 'dotenv'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TweetType } from '~/constants/enums'

config()
class tweetsService {
  async checkAndCreateHashtags(hashtags: string[]) {
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
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
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

  async increaseView(tweet_id: string, userID?: string) {
    const increase = userID ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: increase
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1
        }
      }
    )
    return result.value as {
      user_views: number
      guest_views: number
    }
  }

  async getTweetsChildren(tweet_id: string, page: number, limit: number, type: TweetType, userID?: string) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: type
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
            tweet_children: 0
          }
        }
      ])
      .toArray()

    // tang view cua children tweet khi get duoc
    const tweets_Ids = tweets.map((tweet) => tweet._id as ObjectId)
    const increase = userID ? { user_views: 1 } : { guest_views: 1 }
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweets_Ids
        }
      },
      {
        $inc: increase
      }
    )

    // doc tong so document cua tweet co id tweet cha
    const total = await databaseService.tweets.countDocuments({
      parent_id: new ObjectId(tweet_id),
      type: type
    })

    // sua lai thong tin trong tweets de tra ve cho client
    tweets.forEach((tweet) => {
      if (userID) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })
    return {
      tweets,
      total
    }
  }

  async getNewFeeds(userID: string, limit: number, page: number) {
    //get ra danh sach nguoi ma minh dang follow , tra ve 1 danh sach mang ObjectId
    const follower_user_ids = await databaseService.followers
      .find(
        { user_id: new ObjectId(userID) },
        {
          projection: {
            follower_user_id: 1
          }
        }
      )
      .toArray()
    // danh sach mang objectId nhung nguoi ma minh follow
    const ids = follower_user_ids.map((follower_user_id) => follower_user_id.follower_user_id)
    // them objectId cua ban than vao danh sach mang nay (co the xem tweet ban than va nhung nguoi ma minh follow)
    ids.push(new ObjectId(userID))
    // get tweets cho new feed va tong so document cua tweet
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
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
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
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
            $count: 'count'
          }
        ])
        .toArray()
    ])
    // tang view khi get tweets
    const tweets_ids = tweets.map((tweet) => tweet._id as ObjectId)
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweets_ids
        }
      },
      {
        $inc: { user_views: 1 }
      }
    )
    tweets.forEach((tweet) => {
      tweet.user_views += 1
    })
    // doc tong so document cua tweet co id tweet cha
    return { tweets, total: total[0].count }
  }
}
const TweetsService = new tweetsService()
export default TweetsService
