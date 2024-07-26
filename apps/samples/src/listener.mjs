import ContractListener from '../../modules/listener/src/index.mjs'
import ABIRepository from '../../modules/abi-repository/src/index.mjs'
import ContractHelper from '../../modules/listener/src/utils/contract-helper.mjs'
import BlockcountRepository from '../../modules/listener/src/repositories/blockcount-repository.mjs'

const abiRepositoryConfig = {
  region: process.env.REGION,
  bucketName: process.env.ABI_BUCKET_NAME,
  localStoreABIsList: ['ERC1155Token'],
}
const contractListener = new ContractListener({
  contractHelper: new ContractHelper({
    rpcURL: process.env.RPC_PROVIDER_URL,
    abiLoader: new ABIRepository(abiRepositoryConfig),
  },
  ),
  blockcountRepository: new BlockcountRepository({
    region: process.env.REGION,
    tableName: process.env.BLOCKCOUNT_TABLE_NAME,
  }),
})

const eventFilter = {
  eventName: 'TransferSingle',
  contractName: 'ERC1155Token',
  contractAddress: process.env.ERC1155_CONTRACT_ADDRESS,
}

contractListener.listen(eventFilter, console.log, () => console.log('Listening for events...'))
