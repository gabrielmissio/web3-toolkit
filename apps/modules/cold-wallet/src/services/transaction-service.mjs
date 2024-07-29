import { parseUnits, Transaction } from 'ethers'

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
    serialize = true,
  }) {
    const readOnlyContract = await this.contractHelper.getReadOnlyContract({
      contractAddress: contractAddress,
      contractName: contractName,
    })

    const data = readOnlyContract.interface.encodeFunctionData(contractFuncName, contractFuncArgs)
    const nonce = await this.contractHelper.provider.getTransactionCount(sender)
    const { chainId } = await this.contractHelper.provider.getNetwork()

    // TODO: review gas estimation
    const unsignedTx = {
      chainId,
      to: contractAddress,
      data, // Encoded function call data
      nonce,
      gasLimit: 200000,
      maxFeePerGas: parseUnits('5.0', 'gwei'),
      maxPriorityFeePerGas: parseUnits('1.0', 'gwei'),
    }

    return serialize // EIP-1559 transaction
      ? Transaction.from(unsignedTx).unsignedSerialized
      : Transaction.from(unsignedTx).toJSON()
  }

  // TODO: Add arg to config broadcast behavior (e.g. wait for N confirmations | no wait)
  async broadcastTx(signedTx) {
    const txResponse = await this.contractHelper.provider.broadcastTransaction(signedTx)
    console.log('Transaction sent:', txResponse)
    const receipt = await txResponse.wait()

    return receipt
  }
}
