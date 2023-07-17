import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { ErrorHandler } from './middlewares/error.middleware'
import mediasRouter from './routes/medias.routes'
import { UPLOAD_DIR } from './constants/dir'
import tweetsRouter from './routes/tweets.routes'
const app = express()
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollower()
})
const router = express.Router()
const port = 3000
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use(express.static(UPLOAD_DIR))
app.use(ErrorHandler)
app.listen(port, () => console.log(`listening on  http://localhost:${port}`))
