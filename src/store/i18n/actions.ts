import { ActionTree } from 'vuex'
import { I18nState } from './types'
import { RootState } from '../types'

import { i18n, setCurrentTranslation } from '@/i18n'

export const actions: ActionTree<I18nState, RootState> = {
  async loadTranslation({ commit, state}, lang: string) {
    if (i18n.locale !== lang) {
      if (!state.loadedTranslations.includes(lang)) {
        const messages = await import(/* webpackChunkName: "lang-[request]" */ `@/locales/${lang}.json`)
        i18n.setLocaleMessage(lang, messages.default)
        commit('translationLoaded', lang)
      }

      setCurrentTranslation(lang)
    }
  },
}
