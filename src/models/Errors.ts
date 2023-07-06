import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'

type ErrorType = Record<
  string,
  {
    msg: any
    [key: string]: any
  }
>

//record<string,datatype>  <==> { [field: string]: datatype}
export class ErrorsWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorsWithStatus {
  errors: ErrorType
  constructor({
    message = USERS_MESSAGES.VALIDATION_ERROR,
    status = HTTP_STATUS.UNPROCESSABLE_ENTITY,
    errors
  }: {
    message?: string
    status?: number
    errors: ErrorType
  }) {
    super({ message, status })
    this.errors = errors
  }
}
