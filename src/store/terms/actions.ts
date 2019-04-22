import { ActionTree } from 'vuex'
import { TermsState } from './types'
import { RootState } from '../types'

import { getLabels } from '@/api/wikidata'

export const actions: ActionTree<TermsState, RootState> = {
  async getLabel({ commit, getters }, entityId, lang?) {
    if (getters.hasEntityLabel(entityId, lang, false)) {
      return getters.getEntityLabel(entityId, lang)
    }

    const labels = await getLabels([entityId], lang)
    commit('labelsLoaded', labels)

    return getters.getEntityLabel(entityId, lang)
  },
}
