import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorsWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await validation.run(req)
    const errors = validationResult(req)
    const errorsObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    if (errors.isEmpty()) {
      return next()
    }
    for (const key in errorsObject) {
      const msg = errorsObject[key].msg
      if (msg instanceof ErrorsWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }
    return next(entityError)
  }
}
