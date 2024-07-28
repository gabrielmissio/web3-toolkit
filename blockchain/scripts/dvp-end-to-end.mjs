import {
  getWalletSigner,
  getContractInstance,
} from '../helpers/contract-helper.mjs'

async function main ({ erc20Address, erc1155Address, dvpAddress }) {
  const erc20Owner = getContractInstance({
    sigAddress: process.env.ERC20_OWNER_ADDRESS,
    contractName: 'ERC20Token',
    contractAddress: erc20Address,
  })
  const erc20Customer1 = getContractInstance({
    sigAddress: process.env.CUSTOMER_01_ADDRESS,
    contractName: 'ERC20Token',
    contractAddress: erc20Address,
  })

  const erc1155Owner = getContractInstance({
    sigAddress: process.env.ERC1155_OWNER_ADDRESS,
    contractName: 'ERC1155Token',
    contractAddress: erc1155Address,
  })

  const dvpOwner = getContractInstance({
    sigAddress: process.env.ERC1155_OWNER_ADDRESS,
    contractName: 'DvP',
    contractAddress: dvpAddress,
  })
  const dvpCustomer1 = getContractInstance({
    sigAddress: process.env.CUSTOMER_01_ADDRESS,
    contractName: 'DvP',
    contractAddress: dvpAddress,
  })

  // DvP Owner sets the price of the token
  const setTokenPriceTx = await dvpOwner.setTokenValue(1, 100) // token id, price

  // erc1155 Owner mints 10 units of token 1
  const erc1155MintTx = await erc1155Owner.mint(dvpAddress, 1, 10, '0x') // to, id, amount, data

  // erc20 Owner mints 1000 tokens to Customer 1
  const erc20MintTx = await erc20Owner.mint(process.env.CUSTOMER_01_ADDRESS, 1000) // to, amount
  await sleep(1000)

  // Customer 1 approves DvP to spend 500 tokens
  const erc20ApproveTx = await erc20Customer1.approve(dvpAddress, 500) // spender, amount
  
  // Customer 1 buys 1 unit of token 1
  const dvpExchangeTx = await dvpCustomer1.exchange(1, 1) // id, amount

  return {
    setTokenPriceTx: setTokenPriceTx.hash,
    erc1155MintTx: erc1155MintTx.hash,
    erc20MintTx: erc20MintTx.hash,
    erc20ApproveTx: erc20ApproveTx.hash,
    dvpExchangeTx: dvpExchangeTx.hash,
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main({
  dvpAddress: process.env.DVP_CONTRACT_ADDRESS,
  erc20Address: process.env.ERC20_CONTRACT_ADDRESS,
  erc1155Address: process.env.ERC1155_CONTRACT_ADDRESS,
})
  .then(console.log)
  .catch(console.error)
