import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: ObjectId
}
export default class RefreshToken {
  _id?: ObjectId
  token: string
  created_at: Date
  user_id: ObjectId
  constructor(refreshtoken: RefreshTokenType) {
    this._id = refreshtoken._id
    this.token = refreshtoken.token
    this.created_at = refreshtoken.created_at || new Date()
    this.user_id = refreshtoken.user_id
  }
}
