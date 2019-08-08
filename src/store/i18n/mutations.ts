import { MutationTree } from 'vuex'
import { I18nState } from './types'

export const mutations: MutationTree<I18nState> = {
  translationLoaded(state, lang: string) {
    state.loadedTranslations.push(lang)
  },
  changeTranslation(state, lang: string) {
    state.currentTranslation = lang
  },
  setTranslationFromUri(state) {
     state.translationFromUri = true
  },
}
