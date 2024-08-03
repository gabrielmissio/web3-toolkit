import { TxBuilder } from '../src/services/transaction-service.mjs'
import { BIP32Provider } from '../src/providers/bip32-provider.mjs'
import { KMSProvider } from '../src/providers/kms-provider.mjs'

describe('Simple Ethereum Transaction Signing', () => {
  let kmsAddress
  let bip32Address

  const bip32Provider = new BIP32Provider({
    mnemonic: process.env.MNEMONIC,
  })

  const kmsProvider = new KMSProvider({
    region: process.env.AWS_REGION,
  })

  const txService = new TxBuilder({
    rpcURL: process.env.RPC_PROVIDER_URL, // local hardhat network
  })

  beforeAll(async () => {
    kmsAddress = await kmsProvider.getAddress(process.env.KMS_KEY_ID)
    bip32Address = await bip32Provider.getAddress() // default dp is m/44'/60'/0'/0/0

    const networkUp = await checkNetworkUp(txService.provider)
    expect(networkUp).toBeTruthy()
  })

  test('Should sign and broadcast a transaction using BIP32 provider', async () => {
    const { unsignedTx } = await txService.simpleTx({
      value: '1', // txService parse to eth units
      sender: bip32Address,
      recipient: kmsAddress,
      serialize: false,
    })

    const signedTx = await bip32Provider.sign({ tx: unsignedTx })
    const result = await txService.broadcastTx(signedTx)

    expect(typeof result).toBe('object')
    expect(typeof result.from).toBe('string')
    expect(result.from.toLocaleLowerCase()).toBe(bip32Address.toLocaleLowerCase())
  })

  test('Should sign and broadcast a transaction using KMS provider', async () => {
    const { unsignedTx, chainId } = await txService.simpleTx({
      value: '1', // txService parse to eth units
      sender: kmsAddress,
      recipient: bip32Address,
      serialize: false,
    })

    const signedTx = await kmsProvider.sign({
      tx: unsignedTx,
      sender: kmsAddress,
      keyId: process.env.KMS_KEY_ID,
      chainId,
    })
    const result = await txService.broadcastTx(signedTx)

    expect(typeof result).toBe('object')
    expect(typeof result.from).toBe('string')
    expect(result.from.toLocaleLowerCase()).toBe(kmsAddress.toLocaleLowerCase())
  })
})

async function checkNetworkUp(provider) {
  try {
    await provider.getNetwork()
    return true
  } catch (error) {
    console.error('Network is down', error)
    return false
  }
}
