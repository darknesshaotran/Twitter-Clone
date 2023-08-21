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
app.use(express.static(UPLOAD_DIR))
app.use(ErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://127.0.0.1:5500'
  }
})
const users: { [key: string]: { socket_id: string } } = {}
io.on('connection', (socket) => {
  // console.log(socket.handshake.auth)
  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }
  console.log(users)
  // socket.on('go', (e) => console.log(e))

  socket.on('privateMessage', async (e) => {
    const receiver_socket_id = users[e.to].socket_id
    await databaseService.conversations.insertOne(
      new Conversation({
        sender_id: e.from,
        receiver_id: e.to,
        content: e.content
      })
    )
    socket
      .to(receiver_socket_id)
      .emit('receive privateMessage', { content: e.content, from: user_id, nameSender: e.nameSender })
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
    console.log(users)
  })
})
httpServer.listen(port, () => console.log(`listening on  http://localhost:${port}`))
