import Vue from 'vue'
import VueI18n from 'vue-i18n'
import enMessages from '@/locales/en'

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: {en: enMessages},
})

const loadedTranslations = ['en']

function setCurrentTranslation(lang: string) {
  i18n.locale = lang
}

export async function loadTranslation(lang: string) {
  if (i18n.locale !== lang) {
    if (!loadedTranslations.includes(lang)) {
      const msgs = await import(/* webpackChunkName: "lang-[request]" */ `@/locales/${lang}.ts`)
      i18n.setLocaleMessage(lang, msgs.default)
      loadedTranslations.push(lang)
    }
    setCurrentTranslation(lang)
  }
}

export default i18n
