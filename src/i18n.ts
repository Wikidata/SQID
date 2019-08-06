import Vue from 'vue'
import VueI18n from 'vue-i18n'
import enMessages from '@/locales/en.json'

Vue.use(VueI18n)

const defaultDateTimeFormat = {
      date: {year: 'numeric',
             month: '2-digit',
             day: '2-digit',
            },
      time: {year: 'numeric',
             month: '2-digit',
             day: '2-digit',
             hour: '2-digit',
             minute: '2-digit',
             second: '2-digit',
            },
    }

const dateTimeFormats = {
  en: defaultDateTimeFormat,
  de: defaultDateTimeFormat,
}

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {en: enMessages},
  dateTimeFormats,
})

export function updateCurrentTranslation(lang: string) {
  i18n.locale = lang
}

export default i18n
