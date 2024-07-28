import fs from 'fs'
import path from 'path'
import * as ethers from 'ethers'
import { fileURLToPath } from 'url'

import wallets from './pre-loaded-wallets.mjs'

export function getContractFactory ({ sigAddress, contractName }) {
  const walletSigner = getWalletSigner(sigAddress)
  const { abi, bytecode } = loadMetadata({ contractName })

  const contractFactory = new ethers.ContractFactory(abi, bytecode, walletSigner)

  return contractFactory
}

export function getContractInstance ({ sigAddress, contractName, contractAddress }) {
  const walletSigner = getWalletSigner(sigAddress)
  const { abi } = loadMetadata({ contractName })

  const contract = new ethers.Contract(contractAddress, abi, walletSigner)
  const contractInstance = contract.connect(walletSigner)

  return contractInstance
}

export function getWalletSigner (address) {
  const { rcpUrl, accountKey } = getNetworkConfig(address)

  const provider = new ethers.JsonRpcProvider(rcpUrl)
  const walletSigner = new ethers.Wallet(accountKey, provider)

  return walletSigner
}

export function getProvider () {
  const { rcpUrl } = getNetworkConfig()

  const provider = new ethers.JsonRpcProvider(rcpUrl)

  return provider
}

function getNetworkConfig (address) {
  const account = wallets.has(address)
    ? wallets.get(address)  
    : process.env.ACCOUNT_KEY
  const url = process.env.RCP_PROVIDER_URL

  return {
    rcpUrl: url,
    accountKey: account,
  }
}

function loadMetadata ({ contractName = '' }) {
  const abisPath = '../abis'
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const metadataPath = path.resolve(__dirname, abisPath, `${contractName}.json`) // TODO: ensure path exists

  const metadata = JSON.parse(fs.readFileSync(metadataPath))

  return metadata
}
