import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { ErrorHandler } from './middlewares/error.middleware'
import mediasRouter from './routes/medias.routes'
import { UPLOAD_DIR } from './constants/dir'
import tweetsRouter from './routes/tweets.routes'
import bookmarkRouter from './routes/bookmarks.routes'
import likeRouter from './routes/likes.routes'
import searchRouter from './routes/searchs.routes'
import cors from 'cors'
import { createServer } from 'http'
import conversationRouter from './routes/conversations.routes'
import initSocket from './utils/socket'
const app = express()
const httpServer = createServer(app)
app.use(cors())
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollower()
  databaseService.indexTweet()
})
const router = express.Router()
const port = 3000
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarkRouter)
app.use('/likes', likeRouter)
app.use('/search', searchRouter)
app.use('/conversation', conversationRouter)
app.use(express.static(UPLOAD_DIR))
app.use(ErrorHandler)
initSocket(httpServer)
httpServer.listen(port, () => console.log(`listening on  http://localhost:${port}`))
