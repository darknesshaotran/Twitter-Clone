import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Others'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[] // ['javascript', 'react']
  mentions: string[] // user_id[]
  medias: Media[]
}
