import { MutationTree } from 'vuex'
import { ClassesState, ClassStatistics } from './types'
import { EntityId } from '@/api/types'

export const mutations: MutationTree<ClassesState> = {
  refreshHierarchy: (state) => {
    state.cachedHierarchyRefresh = state.hierarchyRefreshed.getTime()
    state.hierarchyRefreshed = new Date()
  },
  hierarchyRecordsLoaded: (state, statistics: Map<EntityId, ClassStatistics>) => {
    for (const [entityId, record] of statistics) {
      state.hierarchy.set(entityId, record)
    }
  },
}
