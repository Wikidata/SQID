import { Module } from 'vuex'
import { actions } from './actions'
import { mutations } from './mutations'
import { I18nState } from './types'
import { RootState } from '../types'

export const state: I18nState = {
  loadedTranslations: ['en'],
  currentTranslation: 'en',
}

export const i18n: Module<I18nState, RootState> = {
  state,
  mutations,
  actions,
}
