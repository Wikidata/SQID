import { ActionTree } from 'vuex'
import { ClassesState } from './types'
import { RootState } from '@/store/types'
import { EntityId } from '@/api/types'
import { getClassHierarchyChunk, getChunkId } from '@/api/sqid'

export const actions: ActionTree<ClassesState, RootState> = {
  async getClassHierarchyRecord({ dispatch, commit, getters }, entityId: EntityId) {
    const mustRefresh = getters.mustRefreshHierarchy

    if (!mustRefresh && getters.hasHierarchyRecord(entityId)) {
      return getters.getHierarchyRecord(entityId)!
    }

    await dispatch('statistics/refresh', {}, { root: true })

    const chunkId = getChunkId(entityId, 1000)
    const timestamp = (mustRefresh
                       ? getters.lastHierarchyRefresh
                       : getters.cachedHierarchyRefresh)

    const response = await getClassHierarchyChunk(chunkId, timestamp)

    if (mustRefresh) {
      commit('refreshHierarchy')
    }

    commit('hierarchyRecordsLoaded', response)

    return response.get(entityId)!
  },
  async getClassUsageCounts({ commit, getters }, entityIds: EntityId[]) {
    const entities = new Set(entityIds)
    const staleIds = new Set<EntityId>()
    const mustRefresh = getters.mustRefreshHierarchy

    for (const entityId of entityIds) {
      if (mustRefresh || !getters.hasHierarchyRecord(entityId)) {
        staleIds.add(entityId)
      }
    }

    const staleChunks = new Set<number>()
    const timestamp = (mustRefresh
                       ? getters.lastHierarchyRefresh
                       : getters.cachedHierarchyRefresh)

    for (const entityId of staleIds) {
      staleChunks.add(getChunkId(entityId, 1000))
    }

    const requests = []

    for (const chunkId of staleChunks) {
      requests.push(getClassHierarchyChunk(chunkId, timestamp))
    }

    const responses = await Promise.all(requests)

    for (const response of responses) {
      commit('hierarchyRecordsLoaded', response)
    }

    if (mustRefresh) {
      commit('refreshHierarchy')
    }

    const result = new Map<EntityId, number>()
    for (const entityId of entities) {
      result.set(entityId, getters.getHierarchyRecord(entityId)!.allInstances)
    }

    return result
  },
}
