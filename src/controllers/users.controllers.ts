import { Response, Request, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { registerReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
// import User from '~/models/schemas/User.schema'
// import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
export const loginController = async (req: Request, res: Response) => {
  const { user }: any = req
  const userID: ObjectId = user._id
  const result = await usersService.login(userID.toString())
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result: result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, registerReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result: result
  })
}

export const logoutController = async (req: Request, res: Response) => {
  const { Refresh_token }: any = req.body
  const result = await usersService.logout(Refresh_token)
  res.json({
    message: result.message
  })
}
