/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable dot-notation */
import {
  DynamodbConditionExpressionOperand,
  EDynamodbConditionExpressionComparator,
  EDynamodbConditionExpressionFunction,
  DynamodbConditionExpressionAttributes,
} from '../interfaces/dynamodb-condition-expressions-attribute.interface'
import { AuditControlEntity } from '../entities/audit-control.entity'

export const getEntityTableName = <T extends AuditControlEntity>(
  entity: T,
): string => entity['entityTable']

export const getEntityKey = <T extends AuditControlEntity>(
  entity: T,
): AWS.DynamoDB.DocumentClient.Key => {
  const entityKey = entity['entityKey']
  return {
    [entityKey]: entity[entityKey],
  }
}

const getEntityKeyAsMap = <T extends AuditControlEntity>(entity: T) =>
  Object.entries(entity)
    .filter((keyValue) => keyValue[1] !== undefined)
    .map((keyValue) => ({
      [keyValue[0]]: keyValue[1],
    }))

export const getExpressionAttributeNames = <T extends AuditControlEntity>(
  entity: T,
  conditionExpression?: DynamodbConditionExpressionAttributes,
) => {
  const keysAsMap = getEntityKeyAsMap(entity)

  const entityExpressionAttributeNames = keysAsMap.reduce((total, current) => {
    const currentKeys = Object.keys(current)
    return { ...total, [`#${currentKeys[0]}`]: currentKeys[0] }
  }, {})

  let conditionExpressionAttributeNames = {}
  if (conditionExpression) {
    conditionExpressionAttributeNames = {
      ...Object.entries(conditionExpression)
        .filter(
          (operand) =>
            EDynamodbConditionExpressionComparator[operand[1].comparator],
        )
        .reduce((total, current) => {
          return {
            ...total,
            [`#${current[0].toString()}`]: `${current[0].toString()}`,
          }
        }, {}),
    }
  }

  return {
    ...entityExpressionAttributeNames,
    ...conditionExpressionAttributeNames,
  }
}

export const getExpressionAttributeValues = <T extends AuditControlEntity>(
  entity: T,
  conditionExpression?: DynamodbConditionExpressionAttributes,
) => {
  const keysAsMap = getEntityKeyAsMap(entity)

  const entityExpressionAttributeValues = keysAsMap.reduce((total, current) => {
    const keys = Object.keys(current)
    const values = Object.values(current)
    return { ...total, [`:${keys[0].toString()}`]: values[0] }
  }, {})

  let conditionExpressionAttributeValues = {}
  if (conditionExpression) {
    conditionExpressionAttributeValues = {
      ...Object.entries(conditionExpression)
        .filter((operand) => operand[1].rightOperandRawValue)
        .reduce((total, current) => {
          return {
            ...total,
            [`:${current[0].toString()}`]: current[1].rightOperandRawValue
              ? current[1].rightOperandRawValue
              : entity[current[0]],
          }
        }, {}),
    }
  }

  return {
    ...entityExpressionAttributeValues,
    ...conditionExpressionAttributeValues,
  }
}

export const getUpdateExpression = <T extends AuditControlEntity>(
  entity: T,
): string => {
  const entityKey = entity['entityKey']
  const keysAsMap = getEntityKeyAsMap(entity)

  return keysAsMap
    .filter((keyValue) => Object.keys(keyValue)[0] !== entityKey)
    .reduce(
      (total, current, index, arr) =>
        total +
        ` #${Object.keys(current)[0]} = :${Object.keys(current)[0]}${
          arr.length - 1 === index ? '' : ','
        }`,
      'set',
    )
}

export const getPutConditionExpression = <T extends AuditControlEntity>(
  entity: T,
): string => {
  const entityKey: string = entity['entityKey']

  return `attribute_not_exists(${[entityKey].toString()})`
}

export const getUpdateConditionExpression = <T extends AuditControlEntity>(
  entity: T,
  conditionExpression?: DynamodbConditionExpressionAttributes,
): string => {
  const entityKey = entity['entityKey']

  const conditionExpressionLiteral = conditionExpression
    ? Object.entries(conditionExpression)
        .map((condition, index) =>
          conditionExpressionOperandToString(condition[0], condition[1], index),
        )
        .reduce((total, current) => total + ' ' + current, '')
    : ''

  return `#${[entityKey].toString()} = :${[entityKey].toString()}${
    conditionExpression ? `${conditionExpressionLiteral}` : ''
  }`
}

export const conditionExpressionOperandToString = (
  leftOperand: string,
  dynamodbConditionExpressionOperand: DynamodbConditionExpressionOperand,
  itemIndex: number,
): string => {
  const {
    comparator,
    rightOperandRawValue,
    prefixOperand,
  } = dynamodbConditionExpressionOperand

  let expression: string

  switch (dynamodbConditionExpressionOperand.comparator) {
    case EDynamodbConditionExpressionComparator.EQUAL:
    case EDynamodbConditionExpressionComparator.NOT_EQUAL:
    case EDynamodbConditionExpressionComparator.LESSER_THAN:
    case EDynamodbConditionExpressionComparator.LESSER_OR_EQUAL_THAN:
    case EDynamodbConditionExpressionComparator.GREATER_THAN:
    case EDynamodbConditionExpressionComparator.GREATER_OR_EQUAL_THAN:
      expression = `#${leftOperand} ${comparator} :${leftOperand}`
      break

    case EDynamodbConditionExpressionComparator.BETWEEN:
      expression = `#${leftOperand} BETWEEN ${
        rightOperandRawValue.toString() || `:${leftOperand}`
      }`
      break

    case EDynamodbConditionExpressionComparator.IN:
      expression = `#${leftOperand} IN (:${leftOperand})`
      break

    case EDynamodbConditionExpressionFunction.ATTRIBUTE_EXSISTS:
      expression = `attribute_exists(${leftOperand})`
      break

    case EDynamodbConditionExpressionFunction.ATTRIBUTE_NOT_EXSISTS:
      expression = `attribute_not_exists(${leftOperand})`
      break

    case EDynamodbConditionExpressionFunction.ATTRIBUTE_TYPE:
      expression = `attribute_type(${leftOperand},:${leftOperand})`
      break

    case EDynamodbConditionExpressionFunction.BEGINS_WITH:
      expression = `begins_with(${leftOperand},:${leftOperand})`
      break

    case EDynamodbConditionExpressionFunction.CONTAINS:
      expression = `contains(${leftOperand},:${leftOperand})`
      break

    case EDynamodbConditionExpressionFunction.SIZE:
      expression = `size(${leftOperand})`
      break
  }

  return `${itemIndex ? prefixOperand || 'AND' : 'AND'} ${expression}`
}
