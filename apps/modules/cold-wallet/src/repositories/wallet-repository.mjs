/* eslint-disable no-unused-vars*/
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

export default class WalletRepository {
  constructor({ region, tableName }) {
    this.tableName = tableName
    this.client = new DynamoDBClient({ region })
    this.docClient = DynamoDBDocumentClient.from(this.client)
  }

  // ...
}
