import { handlerUploadImage, handlerUploadVideo } from '~/utils/handler'
import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { Media } from '~/models/Others'
import { MediaType } from '~/constants/enums'
config()
class MediasService {
  async UploadImage(req: Request) {
    const files = await handlerUploadImage(req)
    const data: Media[] = await Promise.all(
      files.map(async (file) => {
        const newPath = `${UPLOAD_IMAGE_DIR}/${file.newFilename.split('.')[0]}.jpg`
        await sharp(file.filepath).jpeg({ quality: 90 }).toFile(newPath)
        fs.unlinkSync(file.filepath) // xoa anh tai thu muc moi upload( UPLOAD_IMAGE_TEMP_DIR), chi de lai anh jpg tai thu muc moi
        return {
          url: isProduction
            ? `${process.env.HOST_DOMAIN}/medias/images/${file.newFilename.split('.')[0]}.jpg`
            : `http://localhost:3000/images/${file.newFilename.split('.')[0]}.jpg`,
          type: MediaType.image
        }
      })
    )
    return data
  }

  async UploadVideo(req: Request) {
    const files = await handlerUploadVideo(req)
    const data: Media[] = files.map((file) => {
      const { newFilename } = file
      return {
        url: isProduction
          ? `${process.env.HOST_DOMAIN}/medias/videos/${newFilename.split('.')[0]}.mp4`
          : `http://localhost:3000/videos/temp/${newFilename.split('.')[0]}.mp4`,
        type: MediaType.video
      }
    })
    return data
  }
}

const mediasService = new MediasService()
export default mediasService
