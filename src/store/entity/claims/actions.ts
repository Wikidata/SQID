import { ActionTree } from 'vuex'
import { ClaimsState } from './types'
import { RootState } from '@/store/types'

import { i18n } from '@/i18n'
import { getEntityData } from '@/api/wikidata'

export const actions: ActionTree<ClaimsState, RootState> = {
  async getClaims({ commit, getters }, entityId) {
    if (getters.hasClaims(entityId)) {
      return getters.getClaims(entityId)
    }

    const entityData = await getEntityData(entityId, i18n.locale)
    commit('claimsLoaded', {
      claims: entityData.claims,
    })
  },
}
