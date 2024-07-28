export class HDWallet {
  constructor({ bip32provider, walletRepository }) {
    this.bip32provider = bip32provider
    this.walletRepository = walletRepository
  }

  async get ({ }) {} // Just a placeholder for now...
  // ...

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
    
    // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki // HD Wallets
    // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki // Multi-Account HD Wallets   
    const accountDerivationPath = `m/44'/60'/${accountIndex}'`
    console.log({ accountDerivationPath })

    // Loading current address index from account (+1) 
    const { count: addressIndex } = await this.walletRepository.incrementCounter({ walletId, dp: accountDerivationPath })    

    // m / purpose' / coinType' / account' / change / addressIndex
    const addressDerivationPath = `${accountDerivationPath}/0/${addressIndex - 1}`
    console.log({ addressDerivationPath })

    const node = await this.bip32provider.getAddress({ walletId, dp: addressDerivationPath })  
    const newAddress = await this.walletRepository.saveAddress({
      walletId,
      address: node.address,
      dp: addressDerivationPath,
      type: 'hd',
    })    
  
    return newAddress
  }
}
