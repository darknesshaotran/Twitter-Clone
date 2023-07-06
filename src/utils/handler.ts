import { Request, Response, NextFunction, RequestHandler } from 'express'

export const wrapController = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}
