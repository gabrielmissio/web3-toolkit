import { KMSProvider } from './providers/kms-provider.mjs'

const kmsProvider = new KMSProvider({
  region: process.env.AWS_REGION,
})

kmsProvider.getAddress(process.env.KMS_KEY_ID)
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))
