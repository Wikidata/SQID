import { ActionTree } from 'vuex'
import { RootState } from '../types'

import { i18n } from '@/i18n'
import { getEntityData } from '@/api/wikidata'

export const actions: ActionTree<RootState, RootState> = {
  async getEntityData({ commit, getters }, entityId, lang?) {

    if (getters.hasTerms(entityId, lang) &&
        getters.hasClaims(entityId)) {
      return { ...getters.getTerms(entityId, lang),
               ...getters.getClaims(entityId),
             }
    }

    const langCode = lang || i18n.locale
    const entityData = await getEntityData(entityId, langCode)

    commit('claimsLoaded', {
      claims: entityData.claims,
    })
    commit('termsLoaded', {
      labels: entityData.labels,
      aliases: entityData.aliases,
      descriptions: entityData.descriptions,
    })

    return { ...getters.getTerms(entityId, lang),
             ...getters.getClaims(entityId),
           }
  },
}
