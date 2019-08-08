import { Module } from 'vuex'
import { actions } from './actions'
import { mutations } from './mutations'
import { getters } from './getters'
import { I18nState } from './types'
import { RootState } from '../types'

export const state: I18nState = {
  loadedTranslations: ['en'],
  currentTranslation: 'en',
  translationFromUri: false,
}

export const i18n: Module<I18nState, RootState> = {
  state,
  mutations,
  actions,
  getters,
}
