import { Upload } from '@aws-sdk/lib-storage'
import { S3Client, S3 } from '@aws-sdk/client-s3'
// import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { envConfig } from '~/constants/config'
// dotenv.config()
const s3 = new S3({
  region: envConfig.AWS_REGION,
  credentials: {
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID as string
  }
})

export const uploadFileToS3 = ({
  fileName,
  filePath,
  contentType
}: {
  fileName: string
  filePath: string
  contentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: envConfig.BUCKET_NAME,
      Key: fileName,
      Body: fs.readFileSync(filePath),
      ContentType: contentType
    },
    // bucket: ten bucket trong s3 (aws), key: ten file luu tren s3 (aws), body: file lay ra tu local device (BUFFER),
    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false // optional manually handle dropped parts
  })
  return parallelUploads3.done()
}
