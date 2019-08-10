import { Module } from 'vuex'
import { ClassesState, ClassStatistics } from './types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { RootState } from '@/store/types'
import { EntityId } from '@/api/types'

export const state: ClassesState = {
  hierarchy: new Map<EntityId, ClassStatistics>(),
  hierarchyRefreshed: new Date(0),
  cachedHierarchyRefresh: 0,
}

export const classes: Module<ClassesState, RootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
}
