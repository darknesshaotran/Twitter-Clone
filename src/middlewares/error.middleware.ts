import { Response, Request, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
export const ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log('error:', err)
  res.status(err.status || HTTP_STATUS.INTERAL_SERVER_ERROR).json(err)
}
