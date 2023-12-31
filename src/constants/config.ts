import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
const enviroment = process.env.NODE_ENV
if (!enviroment) {
  console.log('bạn chưa cung cấp biến môi trường (etc: production, staging, development)')
  process.exit(1)
}
console.log(`run with ${enviroment} enviroment`)
if (!fs.existsSync(path.resolve(`.env.${enviroment}`))) {
  console.log(`không tìm thấy file môi trường .env.${enviroment}`)
  console.log('note: app không dùng file .env, nếu môi trường là development thì app dùng file .env.development')
  console.log(`vui lòng tạo file .env.${enviroment} và tham khảo nội dung ở file .env.example`)
  process.exit(1)
}

config({
  path: `.env.${enviroment}`
})
export const Enviroment = enviroment
export const envConfig = {
  // URL FOR ACCESS
  PORT: (process.env.PORT as string) || 3000,
  HOST_DOMAIN: process.env.HOST_DOMAIN as string,
  //  DATABASE INFORMATION
  DB_NAME: process.env.DB_NAME as string,
  DB_USERNAME: process.env.DB_USERNAME as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_USERS_COLLECTION: process.env.DB_USERS_COLLECTION as string,
  DB_REFRESH_TOKENS_COLLECTION: process.env.DB_REFRESH_TOKENS_COLLECTION as string,
  DB_FOLLOWERS_COLLECTION: process.env.DB_FOLLOWERS_COLLECTION as string,
  DB_TWEETS_COLLECTION: process.env.DB_TWEETS_COLLECTION as string,
  DB_HASHTAGS_COLLECTION: process.env.DB_HASHTAGS_COLLECTION as string,
  DB_BOOKMARKS_COLLECTION: process.env.DB_BOOKMARKS_COLLECTION as string,
  DB_LIKES_COLLECTION: process.env.DB_LIKES_COLLECTION as string,
  DB_CONVERSATIONS_COLLECTION: process.env.DB_CONVERSATIONS_COLLECTION as string,
  // CRYPTO KEY
  PASSWORD_SECRET: process.env.PASSWORD_SECRET as string, // for encrypto user's password
  // JWT
  JWT_SECRET: process.env.JWT_SECRET as string,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  // OAUTHS
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL as string,
  CLIENT_HOME_REDIRECT: process.env.CLIENT_HOME_REDIRECT as string,
  // AWS SERVICES
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  AWS_REGION: process.env.AWS_REGION as string,
  SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS as string,
  BUCKET_NAME: process.env.BUCKET_NAME as string
}
