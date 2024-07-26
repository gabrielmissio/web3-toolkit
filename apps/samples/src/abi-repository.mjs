import ABIRepository from '../../modules/abi-repository/src/index.mjs'

const abiRepositoryConfig = {
  bucketName: process.env.ABI_BUCKET_NAME,
  region: process.env.REGION,
  localStoreABIsList: ['ERC20Token', 'ERC1155Token'],
  // localStoreABIsPath: '/home/...CustomPath.../abis'
}
console.log({ abiRepositoryConfig });

(async () => {
  const abiRepository = new ABIRepository(abiRepositoryConfig)

  // Load ERC20 ABI from local storage
  const erc20ABI = await abiRepository.loadABI('ERC20Token')
  console.log({erc20ABI})

  // Upload "custom ERC20" ABI to S3
  const abiUploadResult = await abiRepository.saveABI('CustomERC20', erc20ABI)
  console.log({abiUploadResult})

  // Load "custom ERC20" ABI from S3
  const customErc20ABI = await abiRepository.loadABI('CustomERC20')
  console.log({customErc20ABI})
})().catch(console.error).finally(() => process.exit(0))
