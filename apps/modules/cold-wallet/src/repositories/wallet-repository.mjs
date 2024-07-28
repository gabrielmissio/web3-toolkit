import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

export default class WalletRepository {
  constructor({ region, tableName }) {
    this.tableName = tableName
    this.client = new DynamoDBClient({ region })
    this.docClient = DynamoDBDocumentClient.from(this.client)
  }

  async saveAddress({ walletId, dp, ...data }) {

    const putCommand = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...data,
        PK: walletId,
        SK: dp,
      },
    })
  
    await this.docClient.send(putCommand)
    
    return {
      walletId,
      dp,
      ...data 
    }
  }

  async incrementCounter({ walletId, dp }) {
    // use update with set and return values
    // should create counter from 0 if not exists

    const updateCommand = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        PK: walletId,
        SK: dp,
      },
      UpdateExpression: 'SET #count = if_not_exists(#count, :start) + :inc',
      ExpressionAttributeNames: {
        '#count': 'count',
      },
      ExpressionAttributeValues: {
        ':start': 0,
        ':inc': 1,
      },
      ReturnValues: 'ALL_NEW',
    })

    const result = await this.docClient.send(updateCommand)
    return result.Attributes
  }
}
