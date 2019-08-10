import { ActionTree } from 'vuex'
import { PropertiesState } from './types'
import { RootState } from '@/store/types'
import { EntityId } from '@/api/types'
import { getPropertyClassification, getChunkId,
         getRelatedPropertiesChunk, RelatednessMapping, RelatednessScores } from '@/api/sqid'

export const actions: ActionTree<PropertiesState, RootState> = {
  async refreshClassification({ dispatch, commit, getters }) {
    if (!getters.mustRefreshClassification) {
      return
    }

    await dispatch('statistics/refresh', {}, { root: true })

    const response = await getPropertyClassification(getters.lastClassificationRefresh)
    commit('refreshClassification', response)
  },
  async refreshRelatedProperties({ commit, getters }, propertyIds: EntityId[]) {
    const mustRefresh = getters.mustRefreshRelatedProperties
    const chunkIds = new Set<number>()

    for (const propertyId of propertyIds) {
      chunkIds.add(getChunkId(propertyId, 10))
    }

    const requests = []
    const timestamp = (mustRefresh
                       ? getters.lastRelatedPropertiesRefresh
                       : getters.cachedRelatedPropertiesRefresh)

    for (const chunkId of chunkIds) {
      requests.push(getRelatedPropertiesChunk(chunkId, timestamp))
    }

    const responses = await Promise.all(requests)

    if (mustRefresh) {
      commit('refreshRelatedProperties')
    }

    const result: RelatednessMapping = {}

    for (const response of responses) {
      for (const [entityId, related] of Object.entries(response)) {
        result[entityId] = related as RelatednessScores
      }
    }

    return result
  },
}
