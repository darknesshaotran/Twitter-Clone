import { handlerUploadImage, handlerUploadVideo } from '~/utils/handler'
import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { config } from 'dotenv'
import { Media } from '~/models/Others'
import { MediaType } from '~/constants/enums'
import { uploadFileToS3 } from '~/utils/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
config()
class MediasService {
  async UploadImage(req: Request) {
    const files = await handlerUploadImage(req)
    const data: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = `${file.newFilename.split('.')[0]}`
        const newPath = `${UPLOAD_IMAGE_DIR}/${newName}.jpg`
        await sharp(file.filepath).jpeg({ quality: 90 }).toFile(newPath)
        const s3Result = await uploadFileToS3({
          fileName: `${newName}.jpg`,
          filePath: newPath,
          contentType: 'image/jpeg' // mime.getType(newPath) as string
        })
        fs.unlinkSync(file.filepath) // xoa anh tai thu muc moi upload( UPLOAD_IMAGE_TEMP_DIR), chi de lai anh jpg tai thu muc moi
        fs.unlinkSync(newPath)
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.image
        }
      })
    )
    return data
  }

  async UploadVideo(req: Request) {
    const files = await handlerUploadVideo(req)
    const data: Media[] = await Promise.all(
      files.map(async (file) => {
        const { newFilename, filepath, mimetype } = file
        const newName = `${newFilename.split('.')[0]}.mp4`
        const s3Result = await uploadFileToS3({
          fileName: 'videos/' + newName,
          filePath: filepath,
          contentType: mimetype as string
        })
        fs.unlinkSync(filepath)
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.video
        }
      })
    )
    return data
  }
}

const mediasService = new MediasService()
export default mediasService
