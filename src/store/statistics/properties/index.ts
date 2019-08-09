import { Module } from 'vuex'
import { mutations } from './mutations'
import { getters } from './getters'
import { actions } from './actions'
import { PropertiesState, PropertyClassification } from './types'
import { RootState } from '@/store/types'
import { EntityId } from '@/api/types'
import { RelatednessScores } from '@/api/sqid'

export const state: PropertiesState = {
  propertyGroups: new Object(), // todo(mx): this should be a map, but that breaks vue-devtools
  propertiesByGroup: new Map<PropertyClassification, EntityId[]>(),
  classificationRefreshed: new Date(0),
  relatedPropertiesRefreshed: new Date(0),
  cachedRelatedPropertiesRefresh: 0,

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
