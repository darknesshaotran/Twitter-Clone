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
import YAML from 'yaml'
import fs from 'fs'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import helmet from 'helmet'
import { envConfig } from './constants/config'
const file = fs.readFileSync(path.resolve('./src/twitter-swagger.yaml'), 'utf-8')
const swaggerDocument = YAML.parse(file)
const app = express()
const httpServer = createServer(app)
app.use(helmet())
app.use(cors())
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollower()
  databaseService.indexTweet()
})
const router = express.Router()
const port = envConfig.PORT || 4000
app.use(express.json())
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
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
