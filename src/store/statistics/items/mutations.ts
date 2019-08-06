import { MutationTree } from 'vuex'
import { ItemsState } from './types'
import { SqidEntityStatistics } from '@/api/types'

export const mutations: MutationTree<ItemsState> = {
  refreshItemStatistics: (state, counts: SqidEntityStatistics) => {
    state.count = counts.c
    state.countLabels = counts.cLabels
    state.countStatements = counts.cStmts
    state.countDescriptions = counts.cDesc
    state.countAliases = counts.cAliases
  },
}
