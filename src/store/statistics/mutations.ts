import { MutationTree } from 'vuex'
import { StatisticsState, StatisticsDates, StatisticsSites } from './types'
import { SiteName, SqidSiteLink } from '@/api/types'

export const mutations: MutationTree<StatisticsState> = {
  failedRefresh: (state) => {
    state.refreshedDate = new Date()
  },
  successfulRefresh: (state, {dates, sites}) => {
    state.refreshedDate = new Date()
    state.dumpDate = dates.dumpDate
    state.classesDate = dates.classUpdate
    state.propertiesDate = dates.propertyUpdate
    state.sitelinks = sites.siteLinkCount
    state.sites = sites.sites
  },
}
