import Vue from 'vue'
import { MutationTree } from 'vuex'
import { PropertiesState, PropertyClassification } from './types'
import { EntityId, SqidPropertyStatistics } from '@/api/types'

export const mutations: MutationTree<PropertiesState> = {
  refreshClassification: (state, classification: Map<EntityId, PropertyClassification>) => {
    const propertiesByGroup = new Map<PropertyClassification, EntityId[]>()

    for (const [entityId, kind] of classification) {
      let group = propertiesByGroup.get(kind)

      if (group === undefined) {
        group = []
      }

      group.push(entityId)
      propertiesByGroup.set(kind, group)
    }

    state.propertiesByGroup = propertiesByGroup
    // Vue.set(state, 'propertyGroups', classification) // todo(mx): this breaks vuex debugging
    state.classificationRefreshed = new Date()
  },
  refreshPropertyStatistics: (state, counts: SqidPropertyStatistics) => {
    state.count = counts.c
    state.countLabels = counts.cLabels
    state.countStatements = counts.cStmts
    state.countDescriptions = counts.cDesc
    state.countAliases = counts.cAliases
  },
  invalidateClassification: (state) => {
    state.classificationRefreshed = new Date(0)
    state.propertyGroups = new Map<EntityId, PropertyClassification>()
    state.propertiesByGroup = new Map<PropertyClassification, EntityId[]>()
  },
}
