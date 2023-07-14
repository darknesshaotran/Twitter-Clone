import { Response, Request, NextFunction } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.UploadImage(req)
  res.json({
    mesage: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: result
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.UploadVideo(req)
  res.json({
    mesage: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: result
  })
}
