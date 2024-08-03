import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

export default class ABIRepository {
  constructor({
    region,
    bucketName,
    bucketABIsPath,
    localStoreABIsPath,
    localStoreABIsList,
  }) {
    // TODO: Validate constructor arguments
    // NOTE: bucketName is the only required arg

    this.bucketName = bucketName
    this.bucketABIsPath = bucketABIsPath || 'abis'
    this.localStoreABIsPath = localStoreABIsPath
    this.localStoreABIsList = Array.isArray(localStoreABIsList) ? localStoreABIsList : []
    this.s3Client = new S3Client({ region: region || process.env.REGION || 'us-east-1' })
  }

  async saveABI(abiName, abiContent) {
    if (!abiName) {
      throw new Error('ABI Name is required')
    }
    if (!abiContent) {
      throw new Error('ABI Content is required')
    }

    const putObjectCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${this.bucketABIsPath}/${abiName}.json`,
      Body: JSON.stringify(abiContent),
    })

    await this.s3Client.send(putObjectCommand)

    return true
  }

  // TODO: Add method to return a pre-signed URL to upload an ABI

  async loadABI(abiName) {
    if (this.localStoreABIsList.includes(abiName)) {
      return this.#loadFromLocalStorage(abiName)
    } else {
      return this.#loadFromS3(abiName)
    }
  }

  async #loadFromS3(abiName) {
    if (!abiName) {
      throw new Error('ABI Name is required')
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: `${this.bucketABIsPath}/${abiName}.json`,
    })

    const { Body } = await this.s3Client.send(getObjectCommand)
    if (!Body) {
      throw new Error('ABI not found')
    }
    const data = await Body.transformToString()

    return JSON.parse(data)
  }

  #loadFromLocalStorage(abiName) {
    if (!abiName) {
      throw new Error('ABI Name is required')
    }

    let metadataPath
    if (this.localStoreABIsPath) {
      metadataPath = path.resolve(this.localStoreABIsPath, `${abiName}.json`)
    } else {
      const defaultPath = '../../../../blockchain/abis'
      const __dirname = path.dirname(fileURLToPath(import.meta.url))
      metadataPath = path.resolve(__dirname, defaultPath, `${abiName}.json`)
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath))

    return metadata
  }
}
