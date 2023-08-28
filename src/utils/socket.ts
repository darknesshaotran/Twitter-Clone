import { Server } from 'socket.io'
import Conversation from '../models/schemas/Conversation.schema'
import { ObjectId } from 'mongodb'
import { verifyToken } from '../utils/jwt'
import { ErrorsWithStatus } from '../models/Errors'
import { USERS_MESSAGES } from '../constants/messages'
import HTTP_STATUS from '../constants/httpStatus'
import { UserVerifyStatus } from '../constants/enums'
import databaseService from '~/services/database.services'
import { Server as httpServer } from 'http'

const initSocket = (httpServer: httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://127.0.0.1:5500'
    }
  })
  const users: { [key: string]: { socket_id: string } } = {}
  // SERVER INSTANCE MIDDLEWARE
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
      socket.handshake.auth.accessToken = accessToken
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
    // SOCKET INSTANCE MIDDLEWARE
    socket.use(async (pack, next) => {
      const accessToken = socket.handshake.auth.accessToken
      try {
        await verifyToken({ token: accessToken })
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })
    socket.on('error', (error) => {
      console.log('error socket:', error)
    })
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
}

export default initSocket
