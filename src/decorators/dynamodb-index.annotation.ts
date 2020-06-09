export interface DynmodbIndex {
  indexName: string
  key: string
}

/* eslint-disable dot-notation */
export function DynamodbIndex(indexName: string) {
  return function (target: Object, key: string | symbol) {
    if (target['indexKeys']) {
      target['indexKeys'].push({
        indexName,
        key,
      })
    } else {
      Object.defineProperty(target, 'indexKeys', {
        value: [
          {
            indexName,
            key,
          },
        ],
      })
    }
  }
}
