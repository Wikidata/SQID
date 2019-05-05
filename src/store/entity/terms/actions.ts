import { ActionTree } from 'vuex'
import { TermsState } from './types'
import { RootState } from '@/store/types'

import { getLabels, getEntityData } from '@/api/wikidata'

export const actions: ActionTree<TermsState, RootState> = {
  async getLabel({ commit, getters }, entityId, lang?) {
    if (getters.hasEntityLabel(entityId, lang, false)) {
      return getters.getEntityLabel(entityId, lang)
    }

    const labels = await getLabels([entityId], lang)
    commit('labelsLoaded', labels)

    return getters.getEntityLabel(entityId, lang)
  },
  async getTerms({ commit, getters }, entityId, lang?) {
    if (getters.hasTerms(entityId, lang, false)) {
      return getters.getTerms(entityId, lang)
    }

    const entityData = await getEntityData(entityId, lang)
    commit('termsLoaded', {
      labels: entityData.labels,
      aliases: entityData.aliases,
      descriptions: entityData.descriptions,
    })

    return getters.getTerms(entityId, lang)
  },
}
