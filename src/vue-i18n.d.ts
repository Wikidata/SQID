/* eslint-disable */
import { DefineLocaleMessage, DefineDateTimeFormat, DefineNumberFormat } from 'vue-i18n'
import { enMessages } from '@/locales/en.json'

declare module 'vue-i18n' {
  export type DefineLocalMessage = typeof enMessages

  export interface DefineDateTimeFormat {
    date: DateTimeFormat
    time: DateTimeFormat
    'precision-0': DateTimeFormat
    'precision-1': DateTimeFormat
    'precision-2': DateTimeFormat
    'precision-3': DateTimeFormat
    'precision-4': DateTimeFormat
    'precision-5': DateTimeFormat
    'precision-6': DateTimeFormat
    'precision-7': DateTimeFormat
    'precision-8': DateTimeFormat
    'precision-9': DateTimeFormat
    'precision-10': DateTimeFormat
    'precision-11': DateTimeFormat
    'precision-12': DateTimeFormat
    'precision-13': DateTimeFormat
    'precision-14': DateTimeFormat
  }

  export interface DefineNumberFormat {
    currency: {
      style: 'currency'
      currencyDisplay: 'symbol'
      currency: string
    }
  }
}
