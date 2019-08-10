import { GetterTree } from 'vuex'
import { ClassesState } from './types'
import { RootState } from '@/store/types'
import { EntityId } from '@/api/types'
import { shouldRefresh } from '@/api/sqid'

export const getters: GetterTree<ClassesState, RootState> = {
  mustRefreshHierarchy: (_state, getters) => { // tslint:disable-line:no-shadowed-variable
    const now = new Date().getTime()
    return shouldRefresh(now - getters.lastHierarchyRefresh)
  },
  lastHierarchyRefresh: (state) => {
    return state.hierarchyRefreshed.getTime()
  },
  cachedHierarchyRefresh: (state) => {
    return state.cachedHierarchyRefresh
  },
  hasHierarchyRecord: (state) => (entityId: EntityId) => {
    return state.hierarchy.has(entityId)
  },
  getHierarchyRecord: (state) => (entityId: EntityId) => {
    return state.hierarchy.get(entityId)
  },
}
