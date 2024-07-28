import { SecretsProvider } from '../../modules/vault/src/index.mjs'
import { TxBuilder } from '../../modules/cold-wallet/src/services/transaction-service.mjs'
import { HDWallet } from '../../modules/cold-wallet/src/services/wallet-service.mjs'
import ABIRepository from '../../modules/abi-repository/src/index.mjs'
import ContractHelper from '../../modules/cold-wallet/src/utils/contract-helper.mjs'
import WalletRepository from '../../modules/cold-wallet/src/repositories/wallet-repository.mjs'

const txBuilderDemo = async () => {
  const bip32Provider = new SecretsProvider.BIP32Provider({
    region: process.env.REGION,
    secretId: process.env.SECRET_ID,
    useLocalhost: process.env.USE_LOCALHOST === 'true',
  })

  const contractHelper = new ContractHelper({
    rpcURL: process.env.RPC_PROVIDER_URL,
    abiLoader: new ABIRepository({
      region: process.env.REGION,
      bucketName: process.env.ABI_BUCKET_NAME,
      localStoreABIsList: ['ERC1155Token'],
    }),
  })

  const txBuilder = new TxBuilder({ contractHelper })
  const txBuildArgs = {
    sender: process.env.ERC1155_OWNER_ADDRESS,
    contractAddress: process.env.ERC1155_CONTRACT_ADDRESS,
    contractName: 'ERC1155Token',
    contractFuncName: 'mint',
    contractFuncArgs: [process.env.DVP_CONTRACT_ADDRESS, 1, 10, '0x'],
  }
  console.log({ txBuildArgs })

  const unsignedTx = await txBuilder.contractTx(txBuildArgs)
  console.log({ unsignedTx })

  const signedTx = await bip32Provider.signTx({
    tx: unsignedTx,
    dp: 'm/44\'/60\'/0\'/0/1',
    walletId: 'hardhat-default',
  })
  console.log({ signedTx })

  const receipt = await txBuilder.broadcastTx(signedTx)
  console.log({ receipt })
}

const hdWalletDemo = async () => {
  const bip32Provider = new SecretsProvider.BIP32Provider({
    region: process.env.REGION,
    secretId: process.env.SECRET_ID,
    useLocalhost: process.env.USE_LOCALHOST === 'true',
  })
  const walletRepository = new WalletRepository({
    region: process.env.REGION,
    tableName: process.env.WALLET_ADDRESSES_TABLE_NAME,
  })

  const hdWallet = new HDWallet({
    bip32provider: bip32Provider,
    walletRepository,
  })
  const newAddress = await hdWallet.getNewAddress({
    walletId: 'hardhat-default',
    accountIndex: 1,
  })
  console.log({ newAddress })

  const address = await hdWallet.getInfoFromAddress({
    address: newAddress.address,
  })
  console.log({ address })
}

txBuilderDemo().catch(console.error).finally(() => process.exit(0))
hdWalletDemo().catch(console.error).finally(() => process.exit(0))
