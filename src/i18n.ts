import { createI18n, type I18nOptions } from 'vue-i18n'
import en from '@/locales/en.json'
import axios from 'axios'
import { nextTick } from 'vue'

const year = { year: 'numeric' }
const month = { ...year, month: '2-digit' }
const day = { ...month, day: '2-digit' }
const hour = { ...day, hour: '2-digit' }
const minute = { ...hour, minute: '2-digit' }
const second = { ...minute, second: '2-digit' }

export const defaultDatetimeFormat = {
  date: day,
  time: second,
  'precision-0': year,
  'precision-1': year,
  'precision-2': year,
  'precision-3': year,
  'precision-4': year,
  'precision-5': year,
  'precision-6': year,
  'precision-7': year,
  'precision-8': year,
  'precision-9': year,
  'precision-10': month,
  'precision-11': day,
  'precision-12': hour,
  'precision-13': minute,
  'precision-14': second,
}

const options: I18nOptions = {
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
  datetimeFormats: {
    en: defaultDatetimeFormat,
  },
}

export const i18n = createI18n<false>(options)

export async function updateCurrentTranslation(locale: string) {
  i18n.global.locale.value = locale
  axios.defaults.headers.common['Accept-Language'] = locale
  document?.querySelector('html')?.setAttribute('lang', locale)
}

export async function loadMessages(locale: string) {
  const messages = await import(/* @vite-ignore */ `@/locales${locale}.json`).then(
    (r: any) => r.default ?? r,
  )

  i18n.global.setLocaleMessage(locale, messages)

  return nextTick()
}

export default i18n
