import Vue from 'vue'
import VueI18n from 'vue-i18n'
import enMessages from '@/locales/en.json'

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {en: enMessages},
})

export function setCurrentTranslation(lang: string) {
  i18n.locale = lang
}

export default i18n
