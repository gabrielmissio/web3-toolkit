import { parseUnits } from 'ethers'

export class TxBuilder {
  constructor({ contractHelper }) {
    this.contractHelper = contractHelper
  }

  async contractTx ({
    sender,
    contractName,
    contractAddress,
    contractFuncName,
    contractFuncArgs,
  }) {
    const readOnlyContract = await this.contractHelper.getReadOnlyContract({
      contractAddress: contractAddress,
      contractName: contractName,
    })

    const data = readOnlyContract.interface.encodeFunctionData(contractFuncName, contractFuncArgs)
    const nonce = await this.contractHelper.provider.getTransactionCount(sender)
    // NOTE: evaluate if we really need to include the nonce in the unsigned transaction or do it in another "layer"

    // Get the chainId from the provider
    const network = await this.contractHelper.provider.getNetwork()
    const chainId = network.chainId

    // Define the unsigned transaction
    const unsignedTx = {
      chainId,               // Chain ID
      from: sender,          // Include sender address
      to: contractAddress,   // Contract address
      data: data,            // Encoded function call data
      nonce: nonce,          // Nonce for the sender address

      // private network does not need gasPrice and gasLimit
      // but we are gonna include anyway, so it works with hardhat network
      gasLimit: 100000, // Gas limit for a standard transaction
      maxFeePerGas: parseUnits('5.0', 'gwei'), // Max fee per gas
      maxPriorityFeePerGas: parseUnits('1.0', 'gwei'), // Max priority fee per gas
    }

    return unsignedTx
  }

  async broadcastTx(signedTx) {
    try {
      const txResponse = await this.contractHelper.provider.broadcastTransaction(signedTx)
      console.log('Transaction sent:', txResponse)
      const receipt = await txResponse.wait()
      console.log('Transaction mined:', receipt)
      return receipt
    } catch (error) {
      console.error('Error sending transaction:', error)
      throw error
    }
  }
}
