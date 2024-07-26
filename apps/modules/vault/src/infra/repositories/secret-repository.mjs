import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager'
import memCache from '../helpers/memory-cache.mjs'

export default class SecretRepository {
  constructor({ region }) {
    this.memCache = memCache
    this.smClient = new SecretsManagerClient({ region })
  }

  async loadSecret(key) {
    if (this.memCache.has(key)) {
      return this.memCache.get(key)
    }

    const client = new SecretsManagerClient({
      region: process.env.REGION,
    })
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: key,
      }),
    )

    this.memCache.set(key, JSON.parse(
      response.SecretString,
    ))

    return this.memCache.get(key)
  }
}
