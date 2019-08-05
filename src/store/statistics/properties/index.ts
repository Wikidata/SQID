import { Module } from 'vuex'
import { mutations } from './mutations'
import { getters } from './getters'
import { actions } from './actions'
import { PropertiesState, PropertyClassification } from './types'
import { RootState } from '@/store/types'
import { EntityId } from '@/api/types'

export const state: PropertiesState = {
  propertyGroups: new Map<EntityId, PropertyClassification>(),
  propertiesByGroup: new Map<PropertyClassification, EntityId[]>(),
  classificationRefreshed: new Date(0),

  count: 0,
  countLabels: 0,
  countStatements: 0,
  countDescriptions: 0,
  countAliases: 0,
}

export const properties: Module<PropertiesState, RootState> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
}
