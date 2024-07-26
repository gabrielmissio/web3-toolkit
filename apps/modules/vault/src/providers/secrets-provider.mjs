import { HDNodeWallet, Mnemonic } from 'ethers'
import SecretRepository from '../infra/repositories/secret-repository.mjs'

export class BIP32Provider {
  constructor({ secretId, region, useLocalhost = false }) {
    this.secretId = secretId
    this.useLocalhost = useLocalhost
    this.secretRepository = new SecretRepository({ region })
  }

  // TODO: add support to both TX Object and RLP
  async signTx({ walletId, dp = 'm/44\'/60\'/0\'/0/0', tx }) {
    const wallet = await this.#loadHDWallet({ walletId, dp })
    return wallet.signTransaction(tx)
  }

  async getAddress({ walletId, dp = 'm/44\'/60\'/0\'/0/0' }) {
    const wallet = await this.#loadReadOnlyHDWallet({ walletId, dp })
    return {
      dp: wallet.path,
      address: wallet.address,
      publicKey: wallet.publicKey,
    }
  }

  async exportXPub({ walletId, dp = 'm/44\'/60\'/0\'' }) {
    const wallet = await this.#loadReadOnlyHDWallet({ walletId, dp })
    return {
      dp: wallet.path,
      xpub: wallet.extendedKey,
    }
  }

  async #loadReadOnlyHDWallet({ walletId, dp = 'm/44\'/60\'', password = '' } = {}) {
    const wallet = await this.#loadHDWallet({ walletId, dp, password })
    return wallet.neuter()
  }

  async #loadHDWallet({ walletId, dp = 'm/44\'/60\'', password = '' } = {}) {
    const mnemonic = this.useLocalhost
      ? this.#loadMnemonicFromLocalhost({ walletId })
      : await this.#loadMnemonicFromSecretsManager({ walletId })

    const mnemonicInstance = Mnemonic.fromPhrase(mnemonic, password)
    return HDNodeWallet.fromMnemonic(mnemonicInstance, dp)
  }

  async #loadMnemonicFromSecretsManager({ walletId }) {
    const secret = await this.secretRepository.loadSecret(this.secretId)
    return secret[walletId] // TODO: Add error handling (eg. secret not found)
  }

  #loadMnemonicFromLocalhost({ walletId }) {
    // TODO: Add error handling (eg. mnemonic not found)
    return process.env[walletId.toUpperCase()]
  }
}

export class SingleKeyProvider {
  // just a placeholder for now
}
