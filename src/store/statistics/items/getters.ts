import { GetterTree } from 'vuex'
import { ItemsState } from './types'
import { RootState } from '@/store/types'

export const getters: GetterTree<ItemsState, RootState> = {
  count: (state) => {
    return state.count
  },
  countLabels: (state) => {
    return state.countLabels
  },
  countStatements: (state) => {
    return state.countStatements
  },
  countDescriptions: (state) => {
    return state.countDescriptions
  },
  countAliases: (state) => {
    return state.countAliases
  },
}
