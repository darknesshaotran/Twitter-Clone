import express from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { wrapController } from '~/utils/handler'
const mediasRouter = express.Router()

mediasRouter.post('/upload-image', wrapController(uploadImageController))
mediasRouter.post('/upload-video', wrapController(uploadVideoController))
export default mediasRouter
