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
import { Server } from 'socket.io'
import { create } from 'axios'
import Conversation from './models/schemas/Conversation.schema'
import conversationRouter from './routes/conversations.routes'
import { ObjectId } from 'mongodb'
import { verifyToken } from './utils/jwt'
import { ErrorsWithStatus } from './models/Errors'
import { USERS_MESSAGES } from './constants/messages'
import HTTP_STATUS from './constants/httpStatus'
import { UserVerifyStatus } from './constants/enums'
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

const io = new Server(httpServer, {
  cors: {
    origin: 'http://127.0.0.1:5500'
  }
})
const users: { [key: string]: { socket_id: string } } = {}

io.use(async (socket, next) => {
  const Authorization = socket.handshake.auth.Authorization
  try {
    if (!Authorization) {
      throw new ErrorsWithStatus({
        message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    const accessToken = Authorization.split(' ')[1]
    const decoded_authorization = await verifyToken({ token: accessToken })
    const { verify } = decoded_authorization
    if (verify !== UserVerifyStatus.Verified) {
      throw new ErrorsWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
    socket.handshake.auth.decoded_authorization = decoded_authorization
    next()
  } catch (error) {
    return next({
      message: 'unauthorized',
      name: 'unauthorized_error',
      data: error
    })
  }
})
io.on('connection', (socket) => {
  // console.log(socket.handshake.auth)
  const user_id = socket.handshake.auth.decoded_authorization.userId
  users[user_id] = {
    socket_id: socket.id
  }
  // console.log('user connected')
  // socket.on('go', (e) => console.log(e))

  socket.on('sendMessage', async (data) => {
    const { payload } = data
    const receiver_socket_id = users[payload.receiver_id]?.socket_id
    const conversation = new Conversation({
      sender_id: new ObjectId(payload.sender_id),
      receiver_id: new ObjectId(payload.receiver_id),
      content: payload.content
    })
    const result = await databaseService.conversations.insertOne(conversation)
    conversation._id = result.insertedId
    if (receiver_socket_id) {
      socket.to(receiver_socket_id).emit('receive_Message', { payload: conversation })
    }
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
    // console.log(users)
  })
})
httpServer.listen(port, () => console.log(`listening on  http://localhost:${port}`))
