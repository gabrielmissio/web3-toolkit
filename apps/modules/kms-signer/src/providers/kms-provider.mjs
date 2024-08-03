import {
  KMSClient,
  SignCommand,
  GetPublicKeyCommand,
} from '@aws-sdk/client-kms'
import BN from 'bn.js'
import * as asn1js from 'asn1js'
import { keccak256, Transaction } from 'ethers'
import secp256k1 from 'secp256k1'

export class KMSProvider {
  constructor(config) {
    this.kms = new KMSClient(config)
  }

  async sign({ tx, sender, keyId, chainId }) {
    const txClone = Transaction.from(tx)

    // Hash the serialized transaction using keccak256
    const txHash = keccak256(txClone.unsignedSerialized)
    console.log('Transaction Hash:', txHash)

    // Convert the hash to a buffer
    const digest = Buffer.from(txHash.slice(2), 'hex')

    const signCommand = new SignCommand({
      KeyId: keyId,
      Message: digest,
      MessageType: 'DIGEST', // NOTE: if you use RAW, KMS will hash the message for you (we don't want that here)
      SigningAlgorithm: 'ECDSA_SHA_256',
    })

    const response = await this.kms.send(signCommand)
    // return Buffer.from(response.Signature)

    const signedMessage = Buffer.from(response.Signature)
    const { r, s } = decodeRS(signedMessage)
    // const { v } = calculateV(signedMessage, chainId)
    const v = calculateV(sender, digest, r, s, chainId)

    const signedTx = Transaction.from({
      ...txClone.toJSON(),
      signature: {
        r: '0x' + r.toString('hex'),
        s: '0x' + s.toString('hex'),
        v,
      },
    })
    console.log(signedTx.toJSON())
    return signedTx.serialized
  }

  async createKey() {} // Just a placeholder for now

  async getAddress(keyId) {
    const publicKey = await this.getPublicKey(keyId)
    const address = this.#deriveAddress(publicKey)
    return address
  }

  async getPublicKey(keyId) {
    const derPublicKey = await this.getDerPublickey(keyId)
    const publicKey = this.#convertDerToPublicKey(derPublicKey)
    return publicKey
  }

  async getDerPublickey(keyId)  {
    const getPublickKeyCommand = new GetPublicKeyCommand({
      KeyId: keyId,
    })

    const key = await this.kms.send(getPublickKeyCommand)

    return Buffer.from(key.PublicKey)
  }

  #convertDerToPublicKey(derPublicKey) {
    // TODO: Add comments to explain the magic numbers
    const publicKey = derPublicKey.slice(-65)
    return publicKey.slice(1)
  }

  #deriveAddress(publicKey) {
    // TODO: Add comments to explain the magic numbers

    // Hash the public key using keccak256
    const hash = keccak256(publicKey)
    // Take the last 20 bytes of the hash
    const address = `0x${hash.slice(-40)}`
    return address
  }
}

function decodeRS(signature) {
  const schema = new asn1js.Sequence({ value: [
    new asn1js.Integer({ name: 'r' }),
    new asn1js.Integer({ name: 's' }),
  ]})
  const parsed = asn1js.verifySchema(signature, schema)
  if (!parsed.verified) {
    throw new Error('Failed to parse signature')
  }

  const r = new BN(Buffer.from(parsed.result.r.valueBlock.valueHex))
  let s = new BN(Buffer.from(parsed.result.s.valueBlock.valueHex))

  let secp256k1N = new BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16) // max value on the curve
  let secp256k1halfN = secp256k1N.div(new BN(2)) // half of the curve
  if (s.gt(secp256k1halfN)) {
    s = secp256k1N.sub(s)
  }
  return { r: r.toBuffer(), s: s.toBuffer() }
}

function calculateV(address, digest, r, s, chainId) {
  const publicKey = secp256k1.ecdsaRecover(new Uint8Array(Buffer.concat([r, s])), 0, digest, false)
  const recoveredAddress = `0x${keccak256(publicKey.slice(1)).slice(-40)}`

  if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
    return Number(chainId) * 2 + 35 // v = 27 + chainId * 2 + 8 (EIP-1559)
  } else {
    return Number(chainId) * 2 + 36 // v = 28 + chainId * 2 + 8 (EIP-1559)
  }
}
