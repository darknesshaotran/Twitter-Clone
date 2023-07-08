import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { ErrorsWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
dotenv.config()
export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: any
  privateKey?: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) throw reject(err)
      resolve(token as string)
    })
  })
}

export const verifyToken = ({
  token,
  privateKey = process.env.JWT_SECRET as string
}: {
  token: string
  privateKey?: string
}) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, privateKey, (err, decoded) => {
      if (err) throw reject(new ErrorsWithStatus({ message: err.message, status: HTTP_STATUS.UNAUTHORIZED }))
      resolve(decoded as jwt.JwtPayload)
    })
  })
}
