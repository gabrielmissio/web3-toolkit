import { TxBuilder } from '../src/services/transaction-service.mjs'
import { BIP32Provider } from '../src/providers/bip32-provider.mjs'
import { KMSProvider } from '../src/providers/kms-provider.mjs'
import { ContractHelper } from '../src/utils/contract-helper.mjs'
import ABIRepository from '../../abi-repository/src/index.mjs'

describe('Smart Contract Ethereum Transaction Signing', () => {
  let kmsAddress
  let bip32Address
  let kmsERC20ContractAddress
  let bip32ERC20ContractAddress
  const contractName = 'ERC20Token'

  const bip32Provider = new BIP32Provider({
    mnemonic: process.env.MNEMONIC,
  })

  const kmsProvider = new KMSProvider({
    region: process.env.AWS_REGION,
  })

  const txService = new TxBuilder({
    rpcURL: process.env.RPC_PROVIDER_URL, // local hardhat network
    contractHelper: new ContractHelper({
      rpcURL: process.env.RPC_PROVIDER_URL,
      abiLoader: new ABIRepository({
        region: process.env.AWS_REGION,
        bucketName: process.env.ABI_BUCKET_NAME,
        localStoreABIsList: ['ERC20Token'],
      }),
    }),
  })

  beforeAll(async () => {
    kmsAddress = await kmsProvider.getAddress(process.env.KMS_KEY_ID)
    bip32Address = await bip32Provider.getAddress() // default dp is m/44'/60'/0'/0/0

    const networkUp = await checkNetworkUp(txService.provider)
    expect(networkUp).toBeTruthy()
  })

  describe('Deploy Smart Contract', () => {
    test('Should sign and broadcast a transaction using BIP32 provider', async () => {
      const tokenName = 'MyCoin'
      const tokenSymbol = 'MYC'
      const tokenOwner = bip32Address

      const { unsignedTx } = await txService.deployContractTx({
        contractName,
        constructorArgs: [tokenOwner, tokenName, tokenSymbol],
        sender: bip32Address, // get the nonce from the sender address
        serialize: false,
      })

      const signedTx = await bip32Provider.sign({ tx: unsignedTx })
      const result = await txService.broadcastTx(signedTx)

      expect(typeof result).toBe('object')
      expect(typeof result.from).toBe('string')
      expect(result.from.toLocaleLowerCase()).toBe(bip32Address.toLocaleLowerCase())
      expect(typeof result.contractAddress).toBe('string')

      bip32ERC20ContractAddress = result.contractAddress
    })

    test('Should sign and broadcast a transaction using KMS provider', async () => {
      const tokenName = 'MyCoin'
      const tokenSymbol = 'MYC'
      const tokenOwner = kmsAddress

      const { unsignedTx, chainId } = await txService.deployContractTx({
        contractName,
        constructorArgs: [tokenOwner, tokenName, tokenSymbol],
        sender: kmsAddress, // get the nonce from the sender address
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
      expect(typeof result.contractAddress).toBe('string')

      kmsERC20ContractAddress = result.contractAddress
    })
  })

  describe('Call Deployed Smart Contract', () => {
    test('Should sign and broadcast a transaction using BIP32 provider', async () => {
      const functionName = 'mint'
      const functionArgs = [bip32Address, 1000] // to, amount

      const { unsignedTx } = await txService.contractTx({
        contractName,
        sender: bip32Address,
        contractFuncName: functionName,
        contractFuncArgs: functionArgs,
        contractAddress: bip32ERC20ContractAddress,
        serialize: false,
      })

      const signedTx = await bip32Provider.sign({ tx: unsignedTx })
      const result = await txService.broadcastTx(signedTx)

      expect(typeof result).toBe('object')
      expect(typeof result.from).toBe('string')
      expect(result.from.toLocaleLowerCase()).toBe(bip32Address.toLocaleLowerCase())
    })


    test('Should sign and broadcast a transaction using KMS provider', async () => {
      kmsERC20ContractAddress

      const functionName = 'mint'
      const functionArgs = [kmsAddress, 1000] // to, amount

      const { unsignedTx, chainId } = await txService.contractTx({
        contractName,
        sender: kmsAddress,
        contractFuncName: functionName,
        contractFuncArgs: functionArgs,
        contractAddress: kmsERC20ContractAddress,
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
