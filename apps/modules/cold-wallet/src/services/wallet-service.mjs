/* eslint-disable no-unused-vars*/
import { HDNodeVoidWallet, HDNodeWallet } from 'ethers'
import { bip32provider } from '../../../vault/src/index.mjs'

export default class HDWallet {
  constructor({ bip32provider, walletRepository }) {
    this.bip32provider = bip32provider
    this.walletRepository = walletRepository
  }

  async get ({ walletId, address }) {} // Just a placeholder for now...
  async create ({ walletId, numOfTotalAccounts }) {} // Just a placeholder for now...
  async addAccounts ({ walletId, newNumOfTotalAccounts }) {} // Just a placeholder for now...

  async getNewAddress ({ walletId, accountIndex = 0 }) {} // Just a placeholder for now...

  async simpleTx ({
    walletId,
    sender,
    recipient,
    amount,
    custom,
  }) {
    const tx = {
      // TODO: Build TX
    }
    const dp = '' // TODO: get DP from tx Sender

    // NOTE: Cold wallet does not signTx, just return an "non signer TX"
    const signedTx = await bip32provider.signTx({ walletId, tx, dp })
  }

  async contractTx ({
    walletId,
    sender,
    contractAddress,
    contractAbi,
    contractFuncName,
    contractFuncArgs,
    custom,
  }) {
    const contractABI = [ /* Your contract ABI */ ]
    // const contractAddress = '0xYourContractAddress';

    const tx = {
      // TODO: Build TX
    }
    const dp = '' // TODO: get DP from tx Sender

    // NOTE: Cold wallet does not signTx, just return an "non signer TX"
    const signedTx = await bip32provider.signTx({ walletId, tx, dp })
  }

  async broadcastTx () {} // Just a placeholder for now...
}

// export async function simpleTx ({
//     walletId,
//     sender,
//     recipient,
//     amount,
//     custom
// }) {
//     const tx = {
//         // TODO: Build TX
//     }
//     const dp = '' // TODO: get DP from tx Sender

//     const signedTx = await bip32provider.signTx({ walletId, tx, dp })
// }

// export async function contractTx({
//     walletId,
//     sender,
//     contractAddress,
//     contractAbi,
//     contractFuncName,
//     contractFuncArgs,
//     custom
// }) {
//     const contractABI = [ /* Your contract ABI */ ];
//     // const contractAddress = '0xYourContractAddress';

//     const tx = {
//         // TODO: Build TX
//     }
//     const dp = '' // TODO: get DP from tx Sender

//     const signedTx = await bip32provider.signTx({ walletId, tx, dp })
// }
