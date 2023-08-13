/* eslint-disable */
import { DefineLocaleMessage, DefineDateTimeFormat, DefineNumberFormat } from 'vue-i18n'
import { enMessages } from '@/locales/en.json'
import 'pinia'

declare module 'vue-i18n' {
  export type DefineLocalMessage = typeof enMessages

  const year = { year: 'numeric' }
  const month = { ...year, month: '2-digit' }
  const day = { ...month, day: '2-digit' }
  const hour = { ...day, hour: '2-digit' }
  const minute = { ...hour, minute: '2-digit' }
  const second = { ...minute, second: '2-digit' }

  export interface DefineDateTimeFormat {
    date: day
    time: second
    'precision-0': year
    'precision-1': year
    'precision-2': year
    'precision-3': year
    'precision-4': year
    'precision-5': year
    'precision-6': year
    'precision-7': year
    'precision-8': year
    'precision-9': year
    'precision-10': month
    'precision-11': day
    'precision-12': hour
    'precision-13': minute
    'precision-14': second
  }

  export interface DefineNumberFormat {
    currency: {
      style: 'currency'
      currencyDisplay: 'symbol'
      currency: string
    }
  }
}
