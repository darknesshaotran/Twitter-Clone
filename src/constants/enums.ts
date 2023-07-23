export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  image,
  video
}

export enum TweetType {
  Tweet, // tao bai viet
  Retweet, // chia se bai viet (khong co content)
  Comment,
  QuoteTweet // chia se bai viet ( co content )
}

export enum TweetAudience {
  EveryOne,
  TwitterCircle
}

export enum MediaTypeQuery {
  image = 'image',
  video = 'video'
}
