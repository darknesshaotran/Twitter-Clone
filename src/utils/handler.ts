import { Request, Response, NextFunction, RequestHandler } from 'express'
import path from 'path'
import { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
export const wrapController = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}

export const handlerUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMAGE_TEMP_DIR), // luu file upload vao duong dan thu muc chi dinh
    // path.resolve('uploads'):  thu-muc-chua-project/uploads (Twitter-clone/uploads)
    maxFiles: 4, // chi cho upload 1 file 1 lan
    keepExtensions: true, //giu lai duoi file extension (png, jpeg,pdf,..)
    maxFileSize: 3000 * 1024, // 300KB
    maxTotalFileSize: 3000 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        form.emit('error' as any, new Error('file type is not valid') as any)
      }
      return valid
    }
  })
  // c1:
  // form.parse(req, (err, fields, files) => {
  //   if (err) throw err
  //   return res.json({
  //     message: 'upload successfully'
  //   })
  // })
  // neu su dung call back cho parse nhu tren, khi throw loi, khong the catch loi tai wrapcontroller-> crash app
  //c2:
  // const [fields, files] = await form.parse(req)
  // return res.json({
  //   message: 'upload successfully'
  // })
  //c3:
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[])
    })
  })
}

export const handlerUploadVideo = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_VIDEO_TEMP_DIR), // luu file upload vao duong dan thu muc chi dinh
    maxFiles: 1, // chi cho upload 1 file 1 lan
    keepExtensions: true, //giu lai duoi file extension (png, jpeg,pdf,..)
    maxFileSize: 50 * 1024 * 1024, // 50mb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
      if (!valid) {
        form.emit('error' as any, new Error('file type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log(files)
      if (err) {
        reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.video as File[])
    })
  })
}
