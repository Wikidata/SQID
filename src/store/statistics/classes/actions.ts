import { ActionTree } from 'vuex'
import { ClassesState } from './types'
import { RootState } from '@/store/types'
import { EntityId } from '@/api/types'
import { getClassHierarchyChunk } from '@/api/sqid'
import { parseEntityId } from '@/api/wikidata'

export const actions: ActionTree<ClassesState, RootState> = {
  async getClassHierarchyRecord({ dispatch, commit, getters }, entityId: EntityId) {
    if (!getters.mustRefreshHierarchy && getters.hasHierarchyRecord(entityId)) {
      return getters.getHierarchyRecord(entityId)!
    }

    await dispatch('statistics/refresh', {}, { root: true })

    const { id } = parseEntityId(entityId)
    const chunkId = Math.floor(id / 1000)
    const timestamp = (getters.mustRefreshHierarchy
                       ? getters.lastHierarchyRefresh
                       : getters.cachedHierarchyRefresh)

    const response = await getClassHierarchyChunk(chunkId, timestamp)
    commit('refreshHierarchy')
    commit('hierarchyRecordsLoaded', response)

    return response.get(entityId)!
  },
}
