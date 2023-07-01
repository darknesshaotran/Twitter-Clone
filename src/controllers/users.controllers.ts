import { Response, Request } from 'express'
// import User from '~/models/schemas/User.schema'
// import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'darknessclmm@gmailcom' && password === '1') {
    return res.json({
      message: 'login successful'
    })
  }
  return res.status(400).json({
    message: 'login failed'
  })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await usersService.register({ email: email, password: password })
    res.json({
      message: 'register successful',
      result: result
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      message: `register failed`,
      error: error
    })
  }
}
