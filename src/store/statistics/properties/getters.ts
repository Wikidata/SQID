import { GetterTree } from 'vuex'
import { PropertiesState, PropertyClassification } from './types'
import { RootState } from '@/store/types'
import { EntityId } from '@/api/types'
import { shouldRefresh } from '@/api/sqid'

export const getters: GetterTree<PropertiesState, RootState> = {
  propertyGroups: (state) => (entityId: EntityId) => {
    const kind = ((state as any).propertyGroups[entityId] as PropertyClassification)

    return kind
  },
  propertiesInGroup: (state) => (group: PropertyClassification) => {
    return state.propertiesByGroup.get(group)
  },
  mustRefreshClassification: (_state, getters) => { // tslint:disable-line:no-shadowed-variable
    const now = new Date().getTime()
    return shouldRefresh(now - getters.lastClassificationRefresh)
  },
  lastClassificationRefresh: (state) => {
    return state.classificationRefreshed.getTime()
  },
  count: (state) => {
    return state.count
  },
  countLabels: (state) => {
    return state.countLabels
  },
  countStatements: (state) => {
    return state.countStatements
  },
  countDescriptions: (state) => {
    return state.countDescriptions
  },
  countAliases: (state) => {
    return state.countAliases
  },
}
