import * as ethers from 'ethers'

export default class ContractHelper {
  constructor ({ abiLoader, rpcURL }) {
    this.abiLoader = abiLoader
    this.provider = new ethers.JsonRpcProvider(rpcURL)
  }

  async getReadOnlyContract ({ contractName, contractAddress }) {
    const { abi } = await this.abiLoader.loadABI(contractName)
    const contract = new ethers.Contract(contractAddress, abi, this.provider)

    return contract
  }
}
