import * as ethers from 'ethers'

export class ContractHelper {
  constructor({ rpcURL, abiLoader }) {
    this.provider = new ethers.JsonRpcProvider(rpcURL)
    this.abiLoader = abiLoader
  }

  async getReadOnlyContract ({ contractName, contractAddress }) {
    const { abi } = await this.abiLoader.loadABI(contractName)
    const contract = new ethers.Contract(contractAddress, abi, this.provider)

    return contract
  }

  async getReadOnlyContractFactory ({ contractName }) {
    const { abi, bytecode } = await this.abiLoader.loadABI(contractName)
    const contract = new ethers.ContractFactory(abi, bytecode, this.provider)

    return contract
  }
}
