import { Response, Request, NextFunction } from 'express'
import path from 'path'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.UploadSingleImage(req)
  res.json({
    mesage: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: result
  })
}
