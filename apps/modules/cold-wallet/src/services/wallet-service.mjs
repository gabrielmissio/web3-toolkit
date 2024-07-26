import { HDNodeVoidWallet, HDNodeWallet } from 'ethers'
import { bip32provider } from '../../../vault/src/index.mjs'

export async function createWallet ({ walletId }) {
}

export async function getWallet ({ walletId }) {
}

export async function getAddress ({ walletId, account, index }) {
    // TODO: ensure not return account + index that "does not exists"
}

export async function getNewAddress ({ walletId, account }) {
    // Load last index from walletId + account
}

export async function simpleTx ({
    walletId,
    sender,
    recipient,
    amount,
    custom
}) {
    const tx = {
        // TODO: Build TX
    }
    const dp = '' // TODO: get DP from tx Sender

    const signedTx = await bip32provider.signTx({ walletId, tx, dp })
}

export async function contractTx({
    walletId,
    sender,
    contractAddress,
    contractAbi,
    contractFuncName,
    contractFuncArgs,
    custom
}) {
    const contractABI = [ /* Your contract ABI */ ];
    // const contractAddress = '0xYourContractAddress';

    const tx = {
        // TODO: Build TX
    }
    const dp = '' // TODO: get DP from tx Sender

    const signedTx = await bip32provider.signTx({ walletId, tx, dp })
}

async function _broadcastTx(signedTx) {

}
