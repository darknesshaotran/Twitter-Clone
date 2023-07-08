import { Response, Request, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorsWithStatus } from '~/models/Errors'
export const ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log('error:', err)
  if (err instanceof ErrorsWithStatus) {
    return res.status(err.status).json(err)
  }
  //lay ra toan bo key cua obj error  (err) thanh 1 mang
  const a = Object.getOwnPropertyNames(err)
  a.forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  res.status(HTTP_STATUS.INTERAL_SERVER_ERROR).json({
    message: err.message,
    errors: err
  })
}
