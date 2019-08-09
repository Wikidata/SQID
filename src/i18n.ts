import Vue from 'vue'
import VueI18n from 'vue-i18n'
import enMessages from '@/locales/en.json'

Vue.use(VueI18n)

const year = { year: 'numeric' }
const month = { ...year,
                month: '2-digit',
              }
const day = { ...month,
              day: '2-digit',
            }
const hour = { ...day,
               hour: '2-digit',
             }
const minute = { ...hour,
                 minute: '2-digit',
               }
const second = { ...minute,
                 second: '2-digit',
               }

const defaultDateTimeFormat = {
  'date': day,
  'time': second,
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

const dateTimeFormats = {
  en: defaultDateTimeFormat,
  de: defaultDateTimeFormat,
}

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {en: enMessages},
  dateTimeFormats,
  warnHtmlInMessage: 'warn',
})

export function updateCurrentTranslation(lang: string) {
  i18n.locale = lang
}

export default i18n
