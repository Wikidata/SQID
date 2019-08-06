import { ActionTree } from 'vuex'
import { I18nState } from './types'
import { RootState } from '../types'

import { i18n, updateCurrentTranslation } from '@/i18n'

export const actions: ActionTree<I18nState, RootState> = {
  async loadTranslation({ commit, dispatch, state }, lang: string) {
    if (i18n.locale !== lang) {
      if (!state.loadedTranslations.includes(lang)) {
        const messages = await import(/* webpackChunkName: "lang-[request]" */ `@/locales/${lang}.json`)
        i18n.setLocaleMessage(lang, messages.default)
        commit('translationLoaded', lang)
      }
      commit('changeTranslation', lang)
      dispatch('setCurrentTranslation')
    }
  },
  setCurrentTranslation({ state }) {
    updateCurrentTranslation(state.currentTranslation)
  },
}
