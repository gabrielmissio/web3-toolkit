import { parseUnits, parseEther } from 'ethers'
import { SecretsProvider } from '../../modules/vault/src/index.mjs'

const secretsProviderBip32Config = {
  region: process.env.REGION,
  secretId: process.env.SECRET_ID,
  useLocalhost: process.env.USE_LOCALHOST === 'true',
}
console.log({ secretsProviderBip32Config });

(async () => {
  const bip32Provider = new SecretsProvider.BIP32Provider(secretsProviderBip32Config)

  const xPub = await bip32Provider.exportXPub({ walletId: 'hardhat-default' })
  console.log({ xPub })

  const address = await bip32Provider.getAddress({ walletId: 'hardhat-default' })
  console.log({ address })

  const tx = {
    to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Recipient address
    value: parseEther('0.1'), // Amount to send in ether
    gasLimit: 21000, // Gas limit for a standard transaction
    maxFeePerGas: parseUnits('2.0', 'gwei'), // Max fee per gas
    maxPriorityFeePerGas: parseUnits('1.0', 'gwei'), // Max priority fee per gas
    nonce: 0, // Nonce (transaction count)
    type: 2, // EIP-1559 transaction type
    chainId: 1, // Mainnet chain ID
  }
  const signedTx = await bip32Provider.signTx({
    tx,
    dp: 'm/44\'/60\'/0\'/0/0',
    walletId: 'hardhat-default',
  })
  console.log({ signedTx })
})().catch(console.error).finally(() => process.exit(0))
