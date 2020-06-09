export enum EDynamodbConditionExpressionComparator {
  EQUAL = '=',
  NOT_EQUAL = '<>',
  LESSER_THAN = '<',
  LESSER_OR_EQUAL_THAN = '<=',
  GREATER_THAN = '>',
  GREATER_OR_EQUAL_THAN = '>',
  IN = 'IN',
  BETWEEN = 'BETWEEN',
}

export enum EDynamodbConditionExpressionFunction {
  ATTRIBUTE_EXSISTS = 'attribute_exists',
  ATTRIBUTE_NOT_EXSISTS = 'attribute_not_exists',
  ATTRIBUTE_TYPE = 'attribute_type',
  BEGINS_WITH = 'begins_with',
  CONTAINS = 'contains',
  SIZE = 'size',
}

export interface DynamodbConditionExpressionOperand {
  comparator:
    | EDynamodbConditionExpressionComparator
    | EDynamodbConditionExpressionFunction
  rightOperandRawValue?:
    | string
    | string[]
    | number
    | number[]
    | boolean
    | undefined
  prefixOperand?: 'NOT' | 'AND' | 'OR'
}

export interface DynamodbConditionExpressionAttributes {
  [leftOperand: string]: DynamodbConditionExpressionOperand
}
