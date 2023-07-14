import express from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'
import { wrapController } from '~/utils/handler'
const mediasRouter = express.Router()

mediasRouter.post('/upload-image', wrapController(uploadSingleImageController))
export default mediasRouter
