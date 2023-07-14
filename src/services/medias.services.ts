import { handlerUploadSingleImage } from '~/utils/handler'
import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import fs from 'fs'
class MediasService {
  async UploadSingleImage(req: Request) {
    const file = await handlerUploadSingleImage(req)
    const newPath = `${UPLOAD_DIR}/${file.newFilename.split('.')[0]}.jpg`
    await sharp(file.filepath).jpeg({ quality: 90 }).toFile(newPath)
    fs.unlinkSync(file.filepath) // xoa anh tai thu muc moi upload( upload_temp_dir), chi de lai anh jpg tai thu muc moi
    return `http://localhost:3000/uploads/${file.newFilename.split('.')[0]}.jpg`
  }
}

const mediasService = new MediasService()
export default mediasService
