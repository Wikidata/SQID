import { MutationTree } from 'vuex'
import { PropertiesState, PropertyClassification } from './types'
import { EntityId, SqidEntityStatistics } from '@/api/types'

export const mutations: MutationTree<PropertiesState> = {
  refreshClassification: (state, classification: Map<EntityId, PropertyClassification>) => {
    const propertyGroups: any = new Object()
    const propertiesByGroup = new Map<PropertyClassification, EntityId[]>()

    for (const [entityId, kind] of classification) {
      let group = propertiesByGroup.get(kind)

      if (group === undefined) {
        group = []
      }

      group.push(entityId)
      propertiesByGroup.set(kind, group)
      Object.defineProperty(propertyGroups, entityId, { value: kind,
                                                        configurable: false,
                                                      })
    }

    state.propertiesByGroup = propertiesByGroup
    // todo(mx): this should be a map, but that breaks vue-devtools
    state.propertyGroups = Object.freeze(propertyGroups)
    state.classificationRefreshed = new Date()
  },
  refreshRelatedProperties: (state) => {
    state.cachedRelatedPropertiesRefresh = state.relatedPropertiesRefreshed.getTime()
    state.relatedPropertiesRefreshed = new Date()
  },
  refreshPropertyStatistics: (state, counts: SqidEntityStatistics) => {
    state.count = counts.c
    state.countLabels = counts.cLabels
    state.countStatements = counts.cStmts
    state.countDescriptions = counts.cDesc
    state.countAliases = counts.cAliases
  },
  invalidateClassification: (state) => {
    state.classificationRefreshed = new Date(0)
    state.propertyGroups = {} // todo(mx): this should be a map, but that breaks vue-devtools
    state.propertiesByGroup = new Map<PropertyClassification, EntityId[]>()
  },
  refreshUrlPatterns: (state, urlPatterns) => {
    state.urlPatterns = urlPatterns
    state.urlPatternsRefreshed = new Date()
  },
  refreshPropertyUsage: (state, usage) => {
    state.usage = usage
    state.usageRefreshed = new Date()
  },
}
