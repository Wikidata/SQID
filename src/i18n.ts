import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import axios from 'axios'
import { nextTick } from 'vue'

export const i18n = createI18n<false>({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
  warnHtmlInMessage: 'warn',
  legacy: false,
})

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
