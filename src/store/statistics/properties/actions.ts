import { ActionTree } from 'vuex'
import { PropertiesState, PropertyClassification } from './types'
import { RootState } from '@/store/types'
import { getPropertyClassification } from '@/api/sqid'

export const actions: ActionTree<PropertiesState, RootState> = {
  async refreshClassification({ dispatch, commit, getters }) {
    if (!getters.mustRefreshClassification) {
      return
    }

    await dispatch('statistics/refresh', {}, { root: true })

    const response = await getPropertyClassification(getters.lastClassificationRefresh)
    commit('refreshClassification', response)
  },
}
