export function DynamodbKey() {
  return function (target: Object, key: string | symbol) {
    Object.defineProperty(target, 'entityKey', {
      value: key,
    })
  }
}
