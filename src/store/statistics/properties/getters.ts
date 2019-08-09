import { GetterTree } from 'vuex'
import { PropertiesState, PropertyClassification } from './types'
import { RootState } from '@/store/types'
import { EntityId } from '@/api/types'
import { shouldRefresh } from '@/api/sqid'

function mustRefresh(lastRefresh: number) {
    const now = new Date().getTime()
    return shouldRefresh(now - lastRefresh)
}

export const getters: GetterTree<PropertiesState, RootState> = {
  propertyGroups: (state) => (entityId: EntityId) => {
    const kind = ((state as any).propertyGroups[entityId] as PropertyClassification)

    return kind
  },
  propertiesInGroup: (state) => (group: PropertyClassification) => {
    return state.propertiesByGroup.get(group)
  },
  mustRefreshClassification: (_state, getters) => { // tslint:disable-line:no-shadowed-variable
    return mustRefresh(getters.lastClassificationRefresh)
  },
  lastClassificationRefresh: (state) => {
    return state.classificationRefreshed.getTime()
  },
  mustRefreshRelatedProperties: (_state, getters) => { // tslint:disable-line:no-shadowed-variable
    return mustRefresh(getters.lastRelatedPropertiesRefresh)
  },
  lastRelatedPropertiesRefresh: (state) => {
    return state.relatedPropertiesRefreshed.getTime()
  },
  cachedRelatedPropertiesRefresh: (state) => {
    return state.cachedRelatedPropertiesRefresh
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
