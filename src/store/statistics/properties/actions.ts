import { ActionTree } from 'vuex'
import { PropertiesState } from './types'
import { RootState } from '@/store/types'
import { getRelatedProperties, getPropertyClassification } from '@/api/sqid'

export const actions: ActionTree<PropertiesState, RootState> = {
  async refreshClassification({ dispatch, commit, getters }) {
    if (!getters.mustRefreshClassification) {
      return
    }

    await dispatch('statistics/refresh', {}, { root: true })

    const response = await getPropertyClassification(getters.lastClassificationRefresh)
    commit('refreshClassification', response)
  },
  async refreshRelatedProperties({ dispatch, commit, getters }) {

    if (!getters.mustRefreshRelatedProperties) {
      return await getRelatedProperties(getters.cachedRelatedPropertiesRefresh)
    }

    await dispatch('statistics/refresh', {}, { root: true })

    const response = await getRelatedProperties(getters.lastRelatedPropertiesRefresh)
    commit('refreshRelatedProperties')

    return response
  },
}
