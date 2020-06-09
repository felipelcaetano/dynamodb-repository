import { DateService } from './date.service'

describe('DateService now', () => {
  it('should return a date', () => {
    const now = DateService.now()

    expect(now).toBeTruthy()
  })
})

describe('DateService nowString', () => {
  it('should return a date as string', () => {
    const now = DateService.nowString()

    expect(now).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}-\d{2}:\d{2}/,
    )
  })
})
