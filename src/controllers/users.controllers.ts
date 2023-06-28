import { Response, Request } from 'express'
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
