// https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki // HD Wallets
// https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki // Multi-Account HD Wallets   
export class HDWallet {
  constructor({ bip32provider, walletRepository }) {
    this.bip32provider = bip32provider
    this.walletRepository = walletRepository
  }

  async getInfoFromAddress ({ address }) {
    if (typeof address !== 'string') {
      throw new Error('address must be a string')
    }
    
    const node = await this.walletRepository.getAddress({ address })
    if (!node) {
      throw new Error('Address not found')
    }

    return node
  }

  async getNewAddress ({ walletId, accountIndex = 0 }) {
    if (typeof walletId !== 'string') {
      throw new Error('walletId must be a string')
    }
    if (typeof accountIndex !== 'number') {
      throw new Error('accountIndex must be a number')
    }
    if (accountIndex < 0) {
      throw new Error('accountIndex must be greater than or equal to 0')
    }
    
    // Loading current addressIndex from account (+1) 
    const accountDerivationPath = `m/44'/60'/${accountIndex}'`
    const { count: addressIndex } = await this.walletRepository.incrementCounter({
      walletId,
      dp: accountDerivationPath
    })    

    // m / purpose' / coinType' / account' / change / addressIndex
    const addressDerivationPath = `${accountDerivationPath}/0/${addressIndex - 1}`
    const node = await this.bip32provider.getAddress({
      walletId,
      dp: addressDerivationPath
    })  

    const newAddress = await this.walletRepository.saveAddress({
      walletId,
      address: node.address,
      dp: addressDerivationPath,
      type: 'hd',
    })      
    return newAddress
  }
}
