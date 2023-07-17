import { numberEnumToArray } from '~/utils/common'
import { TweetAudience, TweetType } from './enums'

export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_STRING: 'Name must be a string',
  NAME_LENGTH_FROM_1_TO_50: 'Name legth must be from 1 to 50 characters',
  EMAIL_ALREADY_EXISTS: 'email already exists',
  EMAIL_IS_REQUIRED: 'email is required',
  EMAIL_IS_INVALID: 'email is invalid',
  PASSWORD_IS_REQUIRED: 'password is required',
  PASSWORD_MUST_BE_STRING: 'password must be string',
  PASSWORD_MUST_BE_STRONG: 'the password must be at least 8 characters long and at least 1 number characters long',
  CONFIRM_PASSWORD_IS_REQUIRED: 'confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_STRING: 'confirm password must be a string',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'password confirm does not match password !',
  DATE_OF_BIRTH_MUST_BE_ISO8601_FORMAT: 'date must be ISO 8601 formatted',
  WRONG_EMAIL_OR_PASSWORD: 'Email or password is incorrect !',
  LOGIN_SUCCESS: 'login success',
  LOGOUT_SUCCESS: 'logout success',
  REGISTER_SUCCESS: 'register success',
  ACCESS_TOKEN_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_SUCCESS: 'refresh token is successfully',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  USER_NOT_FOUND: 'User not found',
  EMAIL_VERIFIED: 'Email already has been verified before',
  VERIFY_EMAIL_SUCCESS: 'Verified email successfully',
  EMAIL_IS_NOT_VERIFIED: 'Email is not verified',
  EMAIL_VERIFY_TOKEN_REQUIRED: 'Email verify token is required',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email successfully',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_REQUIRED: 'Forgot password is required',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password successfully',
  FORGOT_PASSWORD_TOKEN_INVALID: 'Forgot password token is invalid',
  RESET_PASSWORD_SUCCESS: 'reset password successfully',
  GET_ME_SUCCESS: 'Get me successfully',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_MUST_BE_STRING: 'bio must be a string',
  LOCATION_MUST_BE_STRING: 'location must be a string',
  WEBSITE_MUST_BE_STRING: 'website must be a string',
  USERNAME_MUST_BE_STRING: 'username must be a string',
  USERNAME_MUST_BE_FROM_5_TO_30: "Username's length must be from 5 to 30 characters",
  USERNAME_EXISTED: 'username already exists',
  AVATAR_MUST_BE_STRING: 'avatar url must be a string',
  COVER_PHOTO_MUST_BE_STRING: 'cover photo url must be a string',
  UPDATE_MY_PROFILE_SUCCESS: 'update profile successfully',
  GET_PROFILE_SUCCESS: 'get profile successfully',
  FOLLOW_SUCCESS: 'follow profile successfully',
  INVALID_FOLLOWER_USER_ID: 'invalid user id',
  FOLLOWED: 'followed',
  ALREADY_UNFOLLOWED: 'already unfollowed',
  UNFOLLOW_SUCCESS: 'unfollow success',
  OLD_PASSWORD_REQUIRED: 'old password is required',
  OLD_PASSWORD_NOT_MATCH: 'old password is not match',
  CHANGE_PASS_SUCCESS: 'change password successfully',
  UPLOAD_SUCCESS: 'upload successfully'
}

export const TWEETS_MESSAGES = {
  TYPE_IS_IN_DEFAULT: `type must be in ${numberEnumToArray(TweetType)}`,
  AUDIENCE_IS_IN_DEFAULT: `audience must be in ${numberEnumToArray(TweetAudience)}`,
  PARENT_ID_MUST_BE_VALID_TWEET_ID: 'parentId must be valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'parentId must be null',
  CONTENT_MUST_BE_EMPTY_STRING: 'content must be an empty string',
  CONTENT_MUST_BE_STRING: 'content must be a string',
  HASHTAG_MUST_BE_STRING: 'hashtag must be a string',
  MENTION_MUST_BE_VALID_USER_ID: 'mention must be a valid user ID',
  MEDIA_MUST_BE_ARRAY_MEDIA_OBJECT: "media must be Media's objects ",
  CREATE_TWEET_SUCCESS: 'create tweet successfully',
  TWEET_ID_IS_INVALID: 'Tweet id is invalid',
  TWEET_NOT_FOUND: 'Tweet not found',
  GET_TWEET_SUCCESS: 'get tweet successfully'
}

export const BOOKMARKS_MESSAGES = {
  BOOKMARK_TWEET_SUCCESS: 'bookmark tweet successfully',
  UNBOOKMARK_TWEET_SUCCESS: 'unbookmark tweet successfully'
}
