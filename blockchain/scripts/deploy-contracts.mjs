import { getContractFactory } from '../helpers/contract-helper.mjs'

async function main() {
  console.log('Deploying ERC20...')
  const erc20Address = await deployERC20({
    ownerAddress: process.env.ERC20_OWNER_ADDRESS,
    tokenName: 'ERC20Token',
    tokenSymbol: 'XPTO',
  })
  console.log('ERC20 deployed:', erc20Address)

  console.log('Deploying ERC1155...')
  const erc1155Address = await deployERC1155({
    ownerAddress: process.env.ERC1155_OWNER_ADDRESS,
    baseURI: 'https://shared-media-from-g.s3.us-east-1.amazonaws.com/1155/metadata/{id}.json',
  })
  console.log('ERC1155 deployed:', erc1155Address)

  console.log('Deploying DvP...')
  const dvpAddress = await deployDvP({
    ownerAddress: process.env.ERC1155_OWNER_ADDRESS,
    ec20Address: erc20Address.contractAddress,
    ec1155Address: erc1155Address.contractAddress,
  })
  console.log('DvP deployed:', dvpAddress)

  return {
    erc20Address,
    erc1155Address,
    dvpAddress,
  }
}

async function deployERC20({ ownerAddress, tokenName, tokenSymbol}) {
  const contractFactory = getContractFactory({
    sigAddress: ownerAddress,
    contractName: 'ERC20Token',
  })

  const deployContractTx = await contractFactory.deploy(
    ownerAddress, tokenName, tokenSymbol,
  )

  await deployContractTx.waitForDeployment()
  const contractAddress = await deployContractTx.getAddress()

  return { contractAddress }
}

async function deployERC1155({ ownerAddress, baseURI }) {
  const contractFactory = getContractFactory({
    sigAddress: ownerAddress,
    contractName: 'ERC1155Token',
  })

  const deployContractTx = await contractFactory.deploy(
    ownerAddress, baseURI,
  )

  await deployContractTx.waitForDeployment()
  const contractAddress = await deployContractTx.getAddress()

  return { contractAddress }
}

async function deployDvP({ ownerAddress, ec20Address, ec1155Address}) {
  const contractFactory = getContractFactory({
    sigAddress: ownerAddress,
    contractName: 'DvP',
  })

  const deployContractTx = await contractFactory.deploy(
    ownerAddress, ec20Address, ec1155Address,
  )

  await deployContractTx.waitForDeployment()
  const contractAddress = await deployContractTx.getAddress()

  return { contractAddress }
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))
