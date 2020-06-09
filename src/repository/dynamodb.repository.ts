/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable dot-notation */
// import { Injectable, NotFoundException } from '@nestjs/common'
import * as AWS from 'aws-sdk'
import { AuditControlEntity } from '../entities/audit-control.entity'
import { DynmodbIndex } from '../decorators/dynamodb-index.annotation'
import { DynamodbConditionExpressionAttributes } from '../interfaces/dynamodb-condition-expressions-attribute.interface'
import {
  getEntityKey,
  getEntityTableName,
  getExpressionAttributeNames,
  getExpressionAttributeValues,
  getUpdateExpression,
  getUpdateConditionExpression,
  getPutConditionExpression,
} from '../mappers/dynamodb-document-client-params.factory'

// @Injectable()
export class DynamodbRepository {
  client: AWS.DynamoDB.DocumentClient
  constructor() {
    this.client = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1',
    })
  }

  public setClient(client: AWS.DynamoDB.DocumentClient) {
    this.client = client
  }

  public async getById<T extends AuditControlEntity>(
    TableName: string,
    Key: AWS.DynamoDB.DocumentClient.Key,
  ): Promise<T> {
    const response = await this.client
      .get({
        Key,
        TableName,
      })
      .promise()

    const Item: AWS.DynamoDB.DocumentClient.AttributeMap = response.Item

    if (!Item) throw new Error()

    return Item as T
  }

  public async create<T extends AuditControlEntity = any>(
    Item: T,
  ): Promise<void> {
    const TableName = getEntityTableName(Item)

    const ConditionExpression = getPutConditionExpression(Item)

    await this.client
      .put({
        Item,
        TableName,
        ConditionExpression,
      })
      .promise()
  }

  public async update<T extends AuditControlEntity = any>(
    entity: T,
    conditionExpression?: DynamodbConditionExpressionAttributes,
    returnNewValues: boolean = false,
  ): Promise<T> {
    const TableName = getEntityTableName(entity)

    const Key = getEntityKey(entity)

    const ExpressionAttributeNames = getExpressionAttributeNames(
      entity,
      conditionExpression,
    )

    const ExpressionAttributeValues = getExpressionAttributeValues(
      entity,
      conditionExpression,
    )

    const UpdateExpression = getUpdateExpression(entity)

    const ConditionExpression = getUpdateConditionExpression(
      entity,
      conditionExpression,
    )

    const ReturnValues = returnNewValues ? 'ALL_NEW' : 'NONE'

    const response = await this.client
      .update({
        Key,
        TableName,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        UpdateExpression,
        ConditionExpression,
        ReturnValues,
      })
      .promise()

    if (returnNewValues) return response.Attributes as T
  }

  private async queryIndex<T>(
    IndexName: string,
    indexAttributes: DynmodbIndex[],
    entity: T,
    FilterExpression: string | undefined = undefined,
    Select: string = 'ALL_ATTRIBUTES',
    Limit: number = 100,
    ScanIndexForward: boolean = true,
    ConsistentRead: boolean = false,
  ): Promise<T[]> {
    const TableName = entity['entityTable']

    const filteredIndexes = indexAttributes.filter(
      (attributes) => attributes.indexName === IndexName,
    )

    const KeyConditionExpression = filteredIndexes.reduce(
      (total, current, index, array) =>
        total +
        `${current.key} = :${current.key}${
          index === array.length - 1 ? '' : ' AND '
        }`,
      '',
    )

    const ExpressionAttributeValues = filteredIndexes.reduce(
      (total, current) => ({
        ...total,
        [`:${current.key}`]: entity[current.key],
      }),
      {},
    )

    const response = await this.client
      .query({
        TableName,
        IndexName,
        KeyConditionExpression,
        ExpressionAttributeValues,
        FilterExpression,
        Select,
        Limit,
        ScanIndexForward,
        ConsistentRead,
      })
      .promise()

    return response.Items as T[]
  }

  public async queryByAllIndexAttributes<T extends AuditControlEntity>(
    IndexName: string,
    entity: T,
    FilterExpression: string | undefined = undefined,
    Select: string = 'ALL_ATTRIBUTES',
    Limit: number = 100,
    ScanIndexForward: boolean = true,
    ConsistentRead: boolean = false,
  ): Promise<T[]> {
    const indexAttributes: DynmodbIndex[] = entity['indexKeys']

    return await this.queryIndex<T>(
      IndexName,
      indexAttributes,
      entity,
      FilterExpression,
      Select,
      Limit,
      ScanIndexForward,
      ConsistentRead,
    )
  }

  public async queryBySpecificIndexAttributes<T extends AuditControlEntity>(
    IndexName: string,
    entity: T,
    indexAtributes: string[],
    FilterExpression: string | undefined = undefined,
    Select: string = 'ALL_ATTRIBUTES',
    Limit: number = 100,
    ScanIndexForward: boolean = true,
    ConsistentRead: boolean = false,
  ): Promise<T[]> {
    const indexAttributes: DynmodbIndex[] = entity[
      'indexKeys'
    ].filter((index: DynmodbIndex) => indexAtributes.includes(index.key))

    return await this.queryIndex<T>(
      IndexName,
      indexAttributes,
      entity,
      FilterExpression,
      Select,
      Limit,
      ScanIndexForward,
      ConsistentRead,
    )
  }
}
