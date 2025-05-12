import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import axios from 'axios'
import { nextTick } from 'vue'
import type { I18nOptions } from 'vue-i18n'

type LanguageRecord = { label: string; flag: string }
export interface Languages {
  [key: string]: LanguageRecord
}

export const FALLBACK_LOCALE = 'en'
export const LOCALES: Languages = {
  en: { label: 'English', flag: '🇬🇧' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
}

const year = { year: 'numeric' } as const
const month = { ...year, month: '2-digit' } as const
const day = { ...month, day: '2-digit' } as const
const hour = { ...day, hour: '2-digit' } as const
const minute = { ...hour, minute: '2-digit' } as const
const second = { ...minute, second: '2-digit' } as const

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
} as const

const options: I18nOptions = {
  legacy: false,
  locale: 'en',
  fallbackLocale: FALLBACK_LOCALE,
  messages: { en },
  datetimeFormats: {
    en: defaultDatetimeFormat,
    de: defaultDatetimeFormat,
  },
}

export const i18n = createI18n<false, typeof options>(options)

export async function updateCurrentTranslation(locale: string) {
  i18n.global.locale.value = locale
  axios.defaults.headers.common['Accept-Language'] = locale
  document?.querySelector('html')?.setAttribute('lang', locale)
}

export async function loadMessages(locale: string) {
  const messages = await import(
    /* webpackChunkName: "locale-[request]" */ `./locales/${locale}.json`
  )

  i18n.global.setLocaleMessage(locale, messages.default)

  return nextTick()
}

export default i18n
