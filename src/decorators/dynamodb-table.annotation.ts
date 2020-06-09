/* eslint-disable dot-notation */
export function DynamodbTable(tableName: string) {
  return function (constructor: Function) {
    constructor.prototype.entityTable = tableName
  }
}
