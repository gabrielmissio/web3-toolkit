import { SecretsProvider } from '../../modules/vault/src/index.mjs'
import { HDWallet } from '../../modules/cold-wallet/src/services/wallet-service.mjs'
import WalletRepository from '../../modules/cold-wallet/src/repositories/wallet-repository.mjs'


(async () => {
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
    walletRepository
  })
  // const newAddress = await hdWallet.getNewAddress({
  //   walletId: 'hardhat-default',
  //   accountIndex: 1
  // })
  // console.log({ newAddress })

  const address = await hdWallet.getInfoFromAddress({
    address: '0x9BF4beE5bfbEbb3a4b7060dAe40CA6fD49305D60'
  })
  console.log({ address })
})().catch(console.error).finally(() => process.exit(0))
