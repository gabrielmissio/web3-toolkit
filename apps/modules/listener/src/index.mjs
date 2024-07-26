export default class ContractListener {
  constructor({ contractHelper, blockcountRepository }) {
    this.contractHelper = contractHelper
    this.blockcountRepository = blockcountRepository
  }

  // TODO: Add "only sync" method
  // TODO: Add "only listen" method
  // TODO: Rename current "listen" method to "syncAndListen"

  async listen(eventFilter, eventHandler, callback) {
    const provider = this.contractHelper.provider
    const blockcount = await this.#loadBlockcount(eventFilter)

    const currentBlock = await provider.getBlockNumber()
    console.log('Blockchain status:',
      { lastFetchedBlock: blockcount.lastFetchedBlock, currentBlock },
    )

    const contractInstance = await this.contractHelper.getReadOnlyContract({
      contractName: eventFilter.contractName, // Just used for identify the contract ABI
      contractAddress: eventFilter.contractAddress,
    })

    if (currentBlock > blockcount.lastFetchedBlock) {
      console.log('Syncing past events...')
      await this.#syncPastEvents(contractInstance, blockcount, eventFilter, eventHandler)
      console.log('Past events synced...')
    }

    provider.on('block', async () => {
      await this.#syncPastEvents(contractInstance, blockcount, eventFilter, eventHandler)
    })

    if (callback && typeof callback === 'function') {
      callback()
    }
  }

  async #loadBlockcount(eventFilter) {
    const blockcount = await this.blockcountRepository.findOne(eventFilter)
    if (!blockcount) {
      await this.blockcountRepository.save({
        contractAddress: eventFilter.contractAddress,
        eventName: eventFilter.eventName,
        lastFetchedBlock: 0,
      })
      return await this.blockcountRepository.findOne(eventFilter)
    }

    return blockcount
  }

  async #syncPastEvents(contractInstance, blockcount, eventFilter, eventHandler) {
    const currentBlock = await this.contractHelper.provider.getBlockNumber()
    const events = await contractInstance.queryFilter(
      eventFilter.eventName, blockcount.lastFetchedBlock, currentBlock,
    )

    for (const event of events) {
      await eventHandler(event)

      if (event.blockNumber > blockcount.lastFetchedBlock) {
        blockcount.lastFetchedBlock = event.blockNumber
        await this.blockcountRepository.save(blockcount)
      }
    }

    if (currentBlock > blockcount.lastFetchedBlock) {
      blockcount.lastFetchedBlock = currentBlock
      await this.blockcountRepository.save(blockcount)
    }
  }

  close() {
    const provider = this.contractHelper.provider
    provider.removeAllListeners('block')
  }
}
