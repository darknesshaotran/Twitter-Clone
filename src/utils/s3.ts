import { Upload } from '@aws-sdk/lib-storage'
import { S3Client, S3 } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
dotenv.config()
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})
// s3.listBuckets({}).then((data) => console.log(data))
// D:\dạy them\haotranhoccode\nodeBasic\Twitter-Clone\uploads\images\93428559e91b113a90c584e00.jpg
const file = fs.readFileSync(path.resolve('uploads/images/93428559e91b113a90c584e00.jpg'))
try {
  const parallelUploads3 = new Upload({
    client: s3,
    params: { Bucket: process.env.BUCKET_NAME, Key: 'anh2.jpg', Body: file, ContentType: 'image/jpeg' },
    // bucket: ten bucket trong s3 (aws), key: ten file luu tren s3 (aws), body: file lay ra tu local device (BUFFER),
    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false // optional manually handle dropped parts
  })

  parallelUploads3.on('httpUploadProgress', (progress) => {
    console.log(progress)
  });

  parallelUploads3.done().then(console.log)
} catch (e) {
  console.log(e)
}
