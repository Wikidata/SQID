import { ActionTree } from 'vuex'
import { StatisticsState } from './types'
import { RootState } from '../types'
import { getStatistics } from '@/api/sqid'
import { SiteName, SqidSiteLink } from '@/api/types'

export const actions: ActionTree<StatisticsState, RootState> = {
  async refresh({ commit, getters }) {
    if (!getters.shouldCheckForUpdate) {
      return
    }

    const response = await getStatistics(getters.lastRefresh)

    const dump = Date.parse(response.dumpDate)
    const classes = Date.parse(response.classUpdate)
    const properties = Date.parse(response.propertyUpdate)

    if ((dump > getters.dumpTimestamp) ||
        (classes > getters.classesTimestamp) ||
        (properties > getters.propertiesTimestamp)) {
      // have new data, update everything
      const dumpDate = new Date(dump)
      const classUpdate = new Date(classes)
      const propertyUpdate = new Date(properties)
      const sites = new Map<SiteName, SqidSiteLink>(Object.entries(response.sites))
      const update = {dates: {dumpDate,
                              classUpdate,
                              propertyUpdate,
                             },
                      sites: {
                        siteLinkCount: response.siteLinkCount,
                        sites,
                      },
                     }

      commit('successfulRefresh', update)
      commit('properties/invalidateClassification', {})
      commit('properties/refreshPropertyStatistics', response.propertyStatistics)
      commit('items/refreshItemStatistics', response.itemStatistics)
    } else {
      // nothing new
      commit('failedRefresh')
    }
  },
}
