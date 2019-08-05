import Vue from 'vue'
import { MutationTree } from 'vuex'
import { StatisticsState, StatisticsDates } from './types'

export const mutations: MutationTree<StatisticsState> = {
  failedRefresh: (state) => {
    Vue.set(state, 'refreshed', new Date())
  },
  successfulRefresh: (state, dates: StatisticsDates) => {
    Vue.set(state, 'refreshed', new Date())
    Vue.set(state, 'dump', dates.dumpDate)
    Vue.set(state, 'classes', dates.classUpdate)
    Vue.set(state, 'properties', dates.propertyUpdate)
  },
}
