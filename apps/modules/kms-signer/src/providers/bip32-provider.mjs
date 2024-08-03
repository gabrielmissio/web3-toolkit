import { HDNodeWallet, Mnemonic } from 'ethers'

export class BIP32Provider {
  constructor({ mnemonic }) {
    this.mnemonic = mnemonic
  }

  async sign({ dp = 'm/44\'/60\'/0\'/0/0', tx }) {
    const wallet = this.#loadHDWallet({ dp })
    return wallet.signTransaction(tx)
  }

  async getAddress({ dp = 'm/44\'/60\'/0\'/0/0' } = {}) {
    const wallet = this.#loadHDWallet({ dp })
    return wallet.address
  }

  #loadHDWallet({ dp = 'm/44\'/60\'', password = '' } = {}) {
    const mnemonicInstance = Mnemonic.fromPhrase(this.mnemonic, password)
    return HDNodeWallet.fromMnemonic(mnemonicInstance, dp)
  }
}
