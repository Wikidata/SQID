import { ActionTree } from 'vuex'
import { PropertiesState } from './types'
import { RootState } from '@/store/types'
import { EntityId } from '@/api/types'
import { parseEntityId } from '@/api/wikidata'
import { getPropertyClassification, getChunkId, getPropertyUsage, getUrlPatterns,
         getRelatedPropertiesChunk, RelatednessMapping, RelatednessScores} from '@/api/sqid'

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
      const { kind } = parseEntityId(propertyId)

      if (kind === 'property') {
        chunkIds.add(getChunkId(propertyId, 10))
      }
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
  async getUrlPattern({ dispatch, commit, getters }, entityId: EntityId) {
    if (!getters.mustRefreshUrlPatterns) {
      return getters.getUrlPattern(entityId)
    }

    await dispatch('statistics/refresh', {}, { root: true })

    const response = await getUrlPatterns(getters.lastUrlPatternsRefresh)
    commit('refreshUrlPatterns', response)

    return response.get(entityId)
  },
  async getPropertyUsage({ dispatch, commit, getters }, entityId: EntityId) {
    if (!getters.mustRefreshUsage) {
      return getters.getUsage(entityId)
    }

    await dispatch('statistics/refresh', {}, { root: true })

    const response = await getPropertyUsage(getters.lastUsageRefresh)
    commit('refreshPropertyUsage', response)

    return getters.getUsage(entityId)
  },
}
