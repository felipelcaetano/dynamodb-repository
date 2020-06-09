import moment from 'moment-timezone'

export const DateService = {
  now(): Date {
    return moment().tz('America/Sao_Paulo').toDate()
  },

  nowString(): string {
    return moment().tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  },
}
