import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { ErrorHandler } from './middlewares/error.middleware'
const app = express()
databaseService.connect()
const router = express.Router()
const port = 3000
app.use(express.json())
app.use('/users', usersRouter)

app.use(ErrorHandler)
app.listen(port, () => console.log(`listening on  http://localhost:${port}`))
