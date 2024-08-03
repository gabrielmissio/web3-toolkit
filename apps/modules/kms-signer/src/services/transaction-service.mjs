import {
  parseEther,
  Transaction,
  JsonRpcProvider,
} from 'ethers'

export class TxBuilder {
  constructor({ rpcURL, contractHelper }) {
    this.provider = new JsonRpcProvider(rpcURL)
    this.contractHelper = contractHelper
  }

  async simpleTx ({
    value,
    sender,
    recipient,
    serialize = true,
  }) {
    const { chainId } = await this.provider.getNetwork()
    const nonce = await this.provider.getTransactionCount(sender)

    // TODO: review gas estimation
    const unsignedTxPayload = {
      chainId,
      to: recipient,
      nonce,
      value: parseEther(value),
      gasLimit: 21000,
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
    }

    const unsignedTx = serialize // EIP-1559 transaction
      ? Transaction.from(unsignedTxPayload).unsignedSerialized
      : Transaction.from(unsignedTxPayload).toJSON()

    return {
      chainId,
      unsignedTx,
    }
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
      contractName, contractAddress,
    })

    const { chainId } = await this.provider.getNetwork()
    const nonce = await this.provider.getTransactionCount(sender)
    const data = readOnlyContract.interface.encodeFunctionData(contractFuncName, contractFuncArgs)

    // TODO: review gas estimation
    const unsignedTxPayload = {
      chainId,
      to: contractAddress,
      data, // Encoded function call data
      nonce,
      gasLimit: 200000,
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
    }

    const unsignedTx = serialize // EIP-1559 transaction
      ? Transaction.from(unsignedTxPayload).unsignedSerialized
      : Transaction.from(unsignedTxPayload).toJSON()

    return {
      chainId,
      unsignedTx,
    }
  }

  async deployContractTx ({
    sender,
    contractName,
    constructorArgs = [],
    serialize = true,
  }) {
    console.log('Deploying contract:', contractName)
    const contractFactory = await this.contractHelper.getReadOnlyContractFactory({ contractName })

    const { chainId } = await this.provider.getNetwork()
    const nonce = await this.provider.getTransactionCount(sender)
    const { data } = await contractFactory.getDeployTransaction(...constructorArgs)
    console.log('Deploy data:', data)

    // TODO: review gas estimation
    const unsignedTxPayload = {
      chainId,
      to: null, // Deploying contracts don't have a recipient
      nonce,
      data, // Bytecode plus encoded constructor arguments
      gasLimit: 3000000,
      maxFeePerGas: 0,
      maxPriorityFeePerGas: 0,
    }

    const unsignedTx = serialize // EIP-1559 transaction
      ? Transaction.from(unsignedTxPayload).unsignedSerialized
      : Transaction.from(unsignedTxPayload).toJSON()

    return {
      chainId,
      unsignedTx,
    }
  }

  // TODO: Add arg to config broadcast behavior (e.g. wait for N confirmations | no wait)
  async broadcastTx(signedTx) {
    // https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction
    const txResponse = await this.provider.broadcastTransaction(signedTx)
    console.log('Transaction sent:', txResponse)
    const receipt = await txResponse.wait()

    return receipt
  }
}
