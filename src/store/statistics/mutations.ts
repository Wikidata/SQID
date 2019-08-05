import { MutationTree } from 'vuex'
import { StatisticsState, StatisticsDates } from './types'

export const mutations: MutationTree<StatisticsState> = {
  failedRefresh: (state) => {
    state.refreshedDate = new Date()
  },
  successfulRefresh: (state, dates: StatisticsDates) => {
    state.refreshedDate = new Date()
    state.dumpDate = dates.dumpDate
    state.classesDate = dates.classUpdate
    state.propertiesDate = dates.propertyUpdate
  },
}
