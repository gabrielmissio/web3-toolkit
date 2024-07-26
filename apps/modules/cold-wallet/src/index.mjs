// import { HDNodeVoidWallet, HDNodeWallet } from 'ethers'
// import { bip32provider } from '../../vault/src/index.mjs'

// bip32provider.exportXPub({ walletId: 'hardhat-default', dp: 'm/44\'/60\'/0\'' }).then((data) => {
//     const wallet = HDNodeWallet.fromExtendedKey(data.xpub)
//     console.log(wallet)

//     const test = wallet.deriveChild(0).deriveChild(0)
//     const test2 = wallet.deriveChild(0).deriveChild(1)
//     const test3 = wallet.deriveChild(0).deriveChild(2)

//     const test4 = wallet.derivePath('0/0')
//     const test5 = wallet.derivePath('0/1')
//     const test6 = wallet.derivePath('0/2')

//     console.log({ test, test2, test3 })
//     console.log('>>>>>>>>>>>>>>>>>>>>')
//     console.log({ test4, test5, test6 })
// }).catch(console.error)

// 2147483648
// bip32provider.exportXPub({ walletId: 'hardhat-default', dp: 'm/44\'/60\'' }).then((data) => {
//     const wallet = HDNodeWallet.fromExtendedKey(data.xpub)
//     console.log(wallet)

//     const test = wallet.deriveChild(2147483647) // 2³¹ - 1
//     const test2 = wallet.deriveChild(0).deriveChild(1)
//     const test3 = wallet.deriveChild(0).deriveChild(2)

//     const test4 = wallet.derivePath("0'/0/0")
//     const test5 = wallet.derivePath('0/1')
//     const test6 = wallet.derivePath('0/2')

//     console.log({ test, test2, test3 })
//     console.log('>>>>>>>>>>>>>>>>>>>>')
//     console.log({ test4, test5, test6 })
// }).catch(console.error)
