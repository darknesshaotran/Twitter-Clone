import { ObjectId } from 'mongodb'

interface HashtagType {
  _id?: ObjectId
  name: string
  created_at?: Date
}

export default class Hashtag {
  _id?: ObjectId
  name: string
  created_at: Date
  constructor(hastag: HashtagType) {
    this._id = hastag._id || new ObjectId()
    this.name = hastag.name
    this.created_at = hastag.created_at || new Date()
  }
}
