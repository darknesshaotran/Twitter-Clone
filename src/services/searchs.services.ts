import { config } from 'dotenv'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import { MediaType, MediaTypeQuery, TweetType } from '~/constants/enums'

config()
class SearchService {
  async searchTweet(
    content: string,
    page: number,
    limit: number,
    userID: string,
    media_type?: MediaTypeQuery,
    people_follow?: string
  ) {
    const filter: any = {
      $text: {
        $search: content
      }
    }
    // neu co media type trong query thi loc ra cac tweet co media type(image, video)
    if (media_type) {
      if (media_type === MediaTypeQuery.image) {
        filter['medias.type'] = MediaType.image
      } else if (media_type === MediaTypeQuery.video) {
        filter['medias.type'] = MediaType.video
      }
    }
    // neu co people_follow trong query thi loc ra cac tweet cua nhung nguoi minh theo doi(1) hoac khong(0)
    if (people_follow && people_follow === '1') {
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
      filter['user_id'] = { $in: ids }
    }
    // get ra tweet co content chua tu duoc search va tong so tweet
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: filter
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
            $match: filter
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
    // cap nhap tweets tra ve client
    tweets.forEach((tweet) => {
      tweet.user_views += 1
    })
    // doc tong so document cua tweet co id tweet cha
    return { tweets, total: total[0] ? total[0].count : 0 }
  }

  async searchHashtagsTweet(
    content: string,
    page: number,
    limit: number,
    userID: string,
    media_type?: MediaTypeQuery,
    people_follow?: string
  ) {
    const filter: any = {}
    filter['hashtags.name'] = content
    // neu co media type trong query thi loc ra cac tweet co media type(image, video)
    if (media_type) {
      if (media_type === MediaTypeQuery.image) {
        filter['medias.type'] = MediaType.image
      } else if (media_type === MediaTypeQuery.video) {
        filter['medias.type'] = MediaType.video
      }
    }
    // neu co people_follow trong query thi loc ra cac tweet cua nhung nguoi minh theo doi(1) hoac khong(0)
    if (people_follow && people_follow === '1') {
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
      filter['user_id'] = { $in: ids }
    }
    // get ra tweet co content chua tu duoc search va tong so tweet
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $match: filter
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
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $match: filter
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
    // cap nhap tweets tra ve client
    tweets.forEach((tweet) => {
      tweet.user_views += 1
    })
    // doc tong so document cua tweet co id tweet cha
    return { tweets, total: total[0] ? total[0].count : 0 }
  }
}
const searchService = new SearchService()
export default searchService
