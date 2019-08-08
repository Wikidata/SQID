import { GetterTree } from 'vuex'
import { I18nState } from './types'
import { RootState } from '@/store/types'

export const getters: GetterTree<I18nState, RootState> = {
  loadedTranslations: (state) => {
    return state.loadedTranslations
  },
  loadedTranslation: (state) => (lang: string) => {
    return state.loadedTranslations.includes(lang)
  },
  currentTranslation: (state) => {
    return state.currentTranslation
  },
  translationSetFromUri: (state) => {
    return state.translationFromUri
  },
}
