import { ObjectId } from 'mongodb'

interface FollowerType {
  _id?: ObjectId
  user_id: ObjectId
  follower_user_id: ObjectId
  created_at?: Date
}
export default class Follower {
  _id?: ObjectId
  user_id: ObjectId
  follower_user_id: ObjectId
  created_at?: Date
  constructor(Follower: FollowerType) {
    this._id = Follower._id
    this.user_id = Follower.user_id
    this.follower_user_id = Follower.follower_user_id
    this.created_at = Follower.created_at || new Date()
  }
}
